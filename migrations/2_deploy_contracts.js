const BhangraCoin = artifacts.require("BhangraCoin");

module.exports = function (deployer) {
    deployer.deploy(BhangraCoin,1000,18);
};
