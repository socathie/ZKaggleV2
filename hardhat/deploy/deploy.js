module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const encryptionVerifier = await deploy('EncryptionVerifier', {
        from: deployer,
        log: true
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
