# Minto NFT Backend Code

**Minto NFT Backend Code** is a backend code written in typescript for minto nft where one can buy,sell,bid for and create NFTs, This Backend code take data form the clientside and stores them MongoDB to keep track of user data and also data on the blockchain

## Running tests

To run the tests, follow these steps. You must have at least node v10 /npm or yarn installed

First clone the repository:

```sh
git clone https://gitlab.com/minto-nft-marketplace/minto-nft-marketplace-backend.git
```

Move into the minto-nft-marketplace-backend working directory

```sh
cd minto-nft-marketplace-backend/
```

Install dependencies

```sh
npm install
```

## Runing the backend code

Backend has 3 deployment servers as found in the package.json file

1. Production Server (For Live and Major Production Deployment On Polygon Mainnet)

    To run For Production Server first, you need to build the project

    ```sh
    npm run build
    ```

    then start production server

     ```sh
    npm run start:prod
    ```
2. Test Server (For Live and Major Production Deployment On Polygon TestNet)

    To run For Test Server first, you need to build the project

    ```sh
    npm run build
    ```

    then start production server

     ```sh
    npm run start:test
    ```

2. Development Server (For Development and testing on your local machine)

    To run For Dev Server simple start the Server with the following command

     ```sh
    npm run start:dev

## Setup

    Make Sure to configure the .env file following the format defined in the .env.example file before running any of the deployment commands.

    Provie all required parameters as listed in the .env.example file

✨  Done 
```
