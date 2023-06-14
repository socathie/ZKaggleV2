module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const pairing100 = await deploy('Pairing100', {
        from: deployer,
        log: true
    });

    const pairing200 = await deploy('Pairing200', {
        from: deployer,
        log: true
    });

    const pairing300 = await deploy('Pairing300', {
        from: deployer,
        log: true
    });

    const pairing400 = await deploy('Pairing400', {
        from: deployer,
        log: true
    });

    const pairing500 = await deploy('Pairing500', {
        from: deployer,
        log: true
    });

    const pairing600 = await deploy('Pairing600', {
        from: deployer,
        log: true
    });

    const pairing700 = await deploy('Pairing700', {
        from: deployer,
        log: true
    });

    const pairing800 = await deploy('Pairing800', {
        from: deployer,
        log: true
    });

    const pairing900 = await deploy('Pairing900', {
        from: deployer,
        log: true
    });

    const pairing1000 = await deploy('Pairing1000', {
        from: deployer,
        log: true
    });

    const encryptionVerifier = await deploy('EncryptionVerifier', {
        from: deployer,
        log: true,
        args: [pairing100.address, pairing200.address, pairing300.address, pairing400.address, pairing500.address, pairing600.address, pairing700.address, pairing800.address, pairing900.address, pairing1000.address]
    });

    await deploy('BountyFactory', {
        from: deployer,
        log: true,
        args: [encryptionVerifier.address]
    });

    await deploy('CircuitVerifier', {
        from: deployer,
        log: true
    });
};
module.exports.tags = ['complete'];
