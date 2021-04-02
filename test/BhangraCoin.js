const BhangraCoin = artifacts.require("BhangraCoin");

contract('BhangraCoin', function(accounts){

    var tokenInstance;

    before(async () => {
        tokenInstance = await BhangraCoin.deployed();
    });

    it('intializes the contract with the correct values and alllocates the initial supply upopn deployment', async function(){
        let name = await tokenInstance.name();
        assert.equal(name, 'Bhangra Coin','has the correct name');
        let symbol = await tokenInstance.symbol();
        assert.equal(symbol, 'BGRA', 'has the correct symbol')
        let standard = await tokenInstance.standard();
        assert.equal(standard, 'Bhangra Coin v1.1', 'has a correct standard');
        let decimals = await tokenInstance.decimals();
        assert.equal(decimals, 18, 'has the correct number of decimals');
        let totalSupply = await tokenInstance.totalSupply();
        assert.equal(totalSupply.toNumber(), 1000, 'sets total supply to 12763636364');
        let adminBalance = await tokenInstance.balanceOf(accounts[0]);
        assert.equal(adminBalance.toNumber(),1000, 'it alllocates the intital supply to the admin account');
    });

    it('transfers token ownership (transfer)', async function(){
        fromAccount = accounts[0];
        toAccount = accounts[1];
        //trying to call a trasfer form the account with 0 balance
        try {
            await tokenInstance.transfer.call(accounts[1],999999999999);
        } catch (error001) {
            assert(error001.message.indexOf('revert')>= 0, 'error message must contain revert');
        }
        let success = await tokenInstance.transfer.call(toAccount, 0, {from: fromAccount});
        assert.equal(success, true, 'it returnes true');
        const {logs} = await  tokenInstance.transfer(toAccount, 123, {from: fromAccount});
        assert.equal(logs.length, 1, 'triggers one event');
        assert.equal(logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(logs[0].args._from, fromAccount, 'logs the account tokens are tansferred from');
        assert.equal(logs[0].args._to, toAccount, 'logs the account tokens are tansferred to');
        assert.equal(logs[0].args._value, 123, 'logs the transfer amount');
        let balanceTo = await tokenInstance.balanceOf(toAccount);
        assert.equal(balanceTo.toNumber(),123, 'adds the amount to the recieving account');
        let balanceFrom = await tokenInstance.balanceOf(fromAccount);
        assert.equal(balanceFrom.toNumber(), 877, 'deducts the amount fomr the sender account');
    });

    it('approves tokens for delegated transfer (approve)', async function() {
        let success = await tokenInstance.approve.call(accounts[1],100);
        assert.equal(success, true, 'it returns true');
        const {logs} = await  tokenInstance.approve(accounts[1], 100, {from: accounts[0]});
        assert.equal(logs.length, 1, 'triggers one event');
        assert.equal(logs[0].event, 'Approval', 'should be the Approval event');
        assert.equal(logs[0].args._owner, accounts[0], 'logs the account tokens are authrized by');
        assert.equal(logs[0].args._spender, accounts[1], 'logs the account tokens are authorized to');
        assert.equal(logs[0].args._value, 100, 'logs the transfer amount');
        let allowance = await tokenInstance.allowance(accounts[0], accounts[1]);
        assert.equal(allowance.toNumber(),100, 'stores the allowance for delegated transfer');
    });

    it('handles delegaged token transfers (transferFrom)', async function() {
        adminAccount = accounts[0];
        fromAccount = accounts[2];
        toAccount = accounts[3];
        spendingAccount = accounts[4];
        // transfer tokens to fromAccount
        await  tokenInstance.transfer(fromAccount, 100, {from: adminAccount});
        await  tokenInstance.approve(spendingAccount, 10, { from: fromAccount});
        //trying to transfer more than the balance
        try {
            await tokenInstance.transferFrom(fromAccount, toAccount, 999999999999, { from: spendingAccount});
        } catch (error002) {
            assert(error002.message.indexOf('revert')>= 0, 'cannot transfer lager than the  balance');
        }
        //trying to transfer more than allowance
        try {
            await tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount});
        } catch (error003) {
            assert(error003.message.indexOf('revert')>= 0, 'cannot transfer lager than the  allowance');
        }
        let success = await tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount});
        assert.equal(success, true);
        const {logs} = await tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount});
        assert.equal(logs.length, 1, 'triggers one event');
        assert.equal(logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(logs[0].args._from, fromAccount, 'logs the account tokens are trasferred from');
        assert.equal(logs[0].args._to, toAccount, 'logs the account tokens are transferred to');
        assert.equal(logs[0].args._value, 10, 'logs the transfer amount');
        let balanceFrom = await tokenInstance.balanceOf(fromAccount);
        assert.equal(balanceFrom.toNumber(), 90, 'deducts the ammount from the sending account');
        let balanceTo = await tokenInstance.balanceOf(toAccount);
        assert.equal(balanceTo.toNumber(),10, 'adds to the amount to the recieving account');
        let allowance = await tokenInstance.allowance(fromAccount, spendingAccount);
        assert.equal(allowance.toNumber(), 0, 'deducts the ammount from the allowance');
    });
});