## Requirements

### postgresql

The simplest way to get this going on a mac is to install the [postgres app](https://postgresapp.com)

### .env

Copy `.env.example` to `.env`, and make it your own.

## Setup

```
$ npm i -g yarn
$ yarn install // you will need to deal with fmg-core and fmg-nitro-adjudicator not being published
$ NODE_ENV=development yarn db:create  // you will need to run `yarn db:drop` if the database already exists
$ NODE_ENV=development yarn db:migrate
$ NODE_ENV=development yarn db:seed
$ yarn watch-server (will rebuild app on file change)

// Opening a channel using the `open_channel_params` from `test_data.ts`:

$ curl -X POST -H "Content-Type: application/json" -H "Accept:application/json" -d "$(cat samples/open_channel.ledger.json)" http://localhost:3000/api/v1/ledger_channels

$ curl -X POST -H "Content-Type: application/json" -H "Accept:application/json" -d "$(cat samples/open_channel.rps.json)" http://localhost:3000/api/v1/rps_channels
$ curl -X POST -H "Content-Type: application/json" -H "Accept:application/json" -d "$(cat samples/update_channel.rps.json)" http://localhost:3000/api/v1/rps_channels
```

## Testing

```
yarn install
NODE_ENV=test yarn db:create
yarn test
```
