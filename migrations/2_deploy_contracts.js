const Poll = artifacts.require("Poll");

module.exports = function(deployer) {
  deployer.deploy(Poll, "is this working?");
};
