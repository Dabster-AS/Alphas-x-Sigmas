# Setting up

I have been using node v16, you should install node with nvm

<https://github.com/nvm-sh/nvm>

Then simply run

```shell
npm install
npx hardhat compile
npx hardhat test
```

To deploy you need to set up hardhat with the correct network and wallet

<https://hardhat.org/config/#networks-configuration>

I have already set it up, so all you need to do is copy .env.example to a new file called .env

```shell
cp .env.example .env
```

Then add all your API-keys to .env

## Deploy

This is the command you use to deploy to Rinkeby

```shell
npx hardhat run --network rinkeby scripts/deploy.ts
AxSClub deployed to: 0xb7d5C7c229aC17182a42c5EcDB995FAD3E486E7F
```

For verification on etherscan this is the command

```shell
npx hardhat verify --network rinkeby 0xb7d5C7c229aC17182a42c5EcDB995FAD3E486E7F {add possible constructor inputs here}
```

as you can see, we need to add all the arguments we used in the constructor
