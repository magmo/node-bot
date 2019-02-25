## Requirements
### postgresql
The simplest way to get this going on a mac is to install the [postgres app](https://postgresapp.com)

## Setup

```
$ npm i -g yarn
$ yarn install // you will need to deal with fmg-core and fmg-nitro-adjudicator not being published
$ yarn db:create  // you will need to run `yarn db:drop` if the database already exists
$ yarn db:migrate
$ yarn db:seed
$ yarn watch-server (will rebuild app on file change)

// Opening a channel using the `open_channel_params` from `test_data.ts`:

$ curl -X POST -H "Content-Type: application/json" -H "Accept:application/json" -d "$(cat open_channel.sample.json)" http://localhost:3000/api/v1/allocator_channels 
```


## Testing

```
yarn install
NODE_ENV=test yarn db:create
yarn test
```