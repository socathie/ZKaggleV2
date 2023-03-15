//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// 2019 OKIMS
//      ported to solidity 0.6
//      fixed linter warnings
//      added requiere error messages
//
//
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;
library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() internal pure returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() internal pure returns (G2Point memory) {
        // Original code point
        return G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );

/*
        // Changed by Jordi point
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
*/
    }
    /// @return r the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) internal pure returns (G1Point memory r) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success,"pairing-add-failed");
    }
    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success,"pairing-mul-failed");
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length,"pairing-lengths-failed");
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[0];
            input[i * 6 + 3] = p2[i].X[1];
            input[i * 6 + 4] = p2[i].Y[0];
            input[i * 6 + 5] = p2[i].Y[1];
        }
        uint[1] memory out;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success,"pairing-opcode-failed");
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}
contract CircuitVerifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alfa1;
        Pairing.G2Point beta2;
        Pairing.G2Point gamma2;
        Pairing.G2Point delta2;
        Pairing.G1Point[] IC;
    }
    struct Proof {
        Pairing.G1Point A;
        Pairing.G2Point B;
        Pairing.G1Point C;
    }
    function verifyingKey() internal pure returns (VerifyingKey memory vk) {
        vk.alfa1 = Pairing.G1Point(
            20491192805390485299153009773594534940189261866228447918068658471970481763042,
            9383485363053290200918347156157836566562967994039712273449902621266178545958
        );

        vk.beta2 = Pairing.G2Point(
            [4252822878758300859123897981450591353533073413197771768651442665752259397132,
             6375614351688725206403948262868962793625744043794305715222011528459656738731],
            [21847035105528745403288232691147584728191162732299865338377159692350059136679,
             10505242626370262277552901082094356697409835680220590971873171140371331206856]
        );
        vk.gamma2 = Pairing.G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );
        vk.delta2 = Pairing.G2Point(
            [21223509572149436009383842546644857332549415106982951130166482247313305552407,
             3651919070680602585131326454611744313033427008208909328852558006475401815457],
            [18868338637417310549300806688818271707183649362616203659593245255731372694149,
             12639385737564052598655546142232001975674170132048529941115373366821228560987]
        );
        vk.IC = new Pairing.G1Point[](32);
        
        vk.IC[0] = Pairing.G1Point( 
            19285368940731314812277377326380883472569493771921601523645257990686666718389,
            1372693327773405640347273163919379519555169290873089668969290615157317568035
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            20563536359277927673211382785955880671029020113525488954738694785575739831195,
            11622487325429485635036204798963062119327899165409993719814798109467539711521
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            8875816761637054206953475440341751666786638952753385218037925061132134808360,
            10670771010820437935149234172619692113592674470313124621792870855604924174724
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            16310041769337439549216324037724832358058235392896021682362617270538374194950,
            19324449383987862762752536963119465502812921099286174351059525673474911225532
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            5783563821028270213576609919720027429769938502424460091302825153121542109354,
            1470669597353590816746365817778990659877634944571654698518112762825899872953
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            914937451350736032348203387680959396512999207088712230002930452486647275486,
            13278992517431057944065874304895401817561900836300928790090187392043172986310
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            18097596007339529406692800143852776601000937260850591264898128684789643908212,
            9153937710318033405384133751664845960297229722568264885716854633955663625536
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            6193249348722695043944500703095878319595334835001600074904795240215318098962,
            7853680886918860231577585366958076401174476205187153074482747182486269572453
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            15270422438445823922593250494709654463789987296743911250277775444865091824612,
            4102182906941581233304729176391766141314683070891114801586417028043961885657
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            1302681630257233329077408872587714433119006291453962064536810133248742069768,
            16311982814639644121944335458064770134173125251073766459777997299727849450385
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            2547973719675613033586687516381437235939306144752695939764438305531826924266,
            18707555548721531003785445481648633019475010768441520378552149383179479150717
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            4428496179622071166051755585560830941147382314141057626874137147454947858555,
            20313942796395280130218843132871495899105990153866314823037951753327298389440
        );                                      
        
        vk.IC[12] = Pairing.G1Point( 
            21090886813683041019220427702428409885856117842016306648411480480763064485622,
            2904286936290379856261715681207382922806286474730092451626811072360471392706
        );                                      
        
        vk.IC[13] = Pairing.G1Point( 
            16953207110836848412348418809752737780820855895491067079125814117205539343156,
            1818176631812756401799820926733888831130235415626052739389592258254689714069
        );                                      
        
        vk.IC[14] = Pairing.G1Point( 
            14275611219479745388903161313834529621377028751523300114715470306855103627468,
            11395634342520831379817961559538472855919256807836266605671005070285381756811
        );                                      
        
        vk.IC[15] = Pairing.G1Point( 
            9309985145070020350527688966527437090410653959124451822044308620974043195469,
            5088783600811643090890999487942869959512873512301353706146318021257882291855
        );                                      
        
        vk.IC[16] = Pairing.G1Point( 
            13845291475527603009053139388380092079280298146548334122387682777257704819701,
            19983427718412885469630659039041222500384101588665734536304699212006998692472
        );                                      
        
        vk.IC[17] = Pairing.G1Point( 
            13231858176024723276494898879866156922615784394666546818166548789657182161333,
            11199542500735857507253092815482494011222825605932956765796942807430804932442
        );                                      
        
        vk.IC[18] = Pairing.G1Point( 
            15155380983211082488641924827916379578962497681571449333022148252969777764037,
            4146224505674490292116190239156754729027337668003337499925105327877886686419
        );                                      
        
        vk.IC[19] = Pairing.G1Point( 
            8169038537569741399573329096561615641148655375190982634441976478639056198693,
            11963650259756467569328883816276529262045940085129455596849074710225723789976
        );                                      
        
        vk.IC[20] = Pairing.G1Point( 
            5768155153658025058286442157394530016577292835139355355291835326382757604073,
            20084350319318171708307617210896946548033127857641151424695801209275721178484
        );                                      
        
        vk.IC[21] = Pairing.G1Point( 
            12703197821467744408272824365427240188730432752459024271595948028914355362762,
            10123119830081479418463659963407526854356320634595089810637209343214392456651
        );                                      
        
        vk.IC[22] = Pairing.G1Point( 
            18202154060412128906014642267610638621848197350141370475801967787541536447902,
            7172856910555396735982105446089210786857646719326360443646152381651817923139
        );                                      
        
        vk.IC[23] = Pairing.G1Point( 
            17170777702061064354926492758896433985012177585871248144609849735893537428237,
            412998423308992625938675915107301585996363349849877844235609364273086873580
        );                                      
        
        vk.IC[24] = Pairing.G1Point( 
            3545350639001990923140538415427584236524735576470412437640669325012183149004,
            20188177885143613106665205433040400257378338431586890569517744733352415194844
        );                                      
        
        vk.IC[25] = Pairing.G1Point( 
            21431297364806809809353204501967336223370018667834067200289961618421550463576,
            6224434139824781014957254620472227483320631913991355808517618408479036778646
        );                                      
        
        vk.IC[26] = Pairing.G1Point( 
            20280682591691563582384585973340321812285845652705934582770347952936885495314,
            12208275392540746880779008886418423836514168579437691486870715982767835559268
        );                                      
        
        vk.IC[27] = Pairing.G1Point( 
            10015165244416857193592336278992467819961744116081081647783642516266955540912,
            20130961332116514755984061027376120975717399625907757330731812572615020936707
        );                                      
        
        vk.IC[28] = Pairing.G1Point( 
            8336371214105638859634154554031929460603615856662424524205559804248139721705,
            15877135363481174608851919525400781895600679056573072501733758948126246943151
        );                                      
        
        vk.IC[29] = Pairing.G1Point( 
            14076177816885665971918033670006882703355155560752256957969673368434759377466,
            4110228092353627263550493253063698850130425422586685028497387964159506802444
        );                                      
        
        vk.IC[30] = Pairing.G1Point( 
            21779324301473364824100454032265775775351274040721207181034336488931253729090,
            501953779072995894027107266033339049457352284371355668744583435564783383240
        );                                      
        
        vk.IC[31] = Pairing.G1Point( 
            17060488929845011250862811192805763333332019172161699169052857724884424599208,
            8629028379209702408634728188414144519665064163607186328886948451932454722462
        );                                      
        
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.IC.length,"verifier-bad-input");
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field,"verifier-gte-snark-scalar-field");
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.IC[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.IC[0]);
        if (!Pairing.pairingProd4(
            Pairing.negate(proof.A), proof.B,
            vk.alfa1, vk.beta2,
            vk_x, vk.gamma2,
            proof.C, vk.delta2
        )) return 1;
        return 0;
    }
    /// @return r  bool true if proof is valid
    function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[] memory input
        ) public view returns (bool r) {
        Proof memory proof;
        proof.A = Pairing.G1Point(a[0], a[1]);
        proof.B = Pairing.G2Point([b[0][0], b[0][1]], [b[1][0], b[1][1]]);
        proof.C = Pairing.G1Point(c[0], c[1]);

        if (verify(input, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
