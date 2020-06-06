# Project Discontinued
Virgin JS server loool. I don't even remember how to set this thing up again.

# YummyGame
Open source replica of paper.io (old version)

This is a tile based multiplayer game.

## Notes
There's a simple login api (supports discord & facebook & google oauth2) with mongodb. (copypasta from older project).
THere's no node webserver for this and you will need nginx for it to work.
Sample nginx config file: (note that in `config/` folder you can configure how many instance of the server to run which players can connect to from the lobby.
```
server {
    server_name localhost;
    location /api/ {
        proxy_pass http://localhost:3000/;
    }

    location /classic1/ {
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_pass http://localhost:3001/;
    }

    location / {
        root path/to/YummyGame/web;
        index index.html;
    }
}
```

## Installation
```bash
git clone https://github.com/Yuu6883/YummyGame
npm i
```

## Run
```bash
npm run prod
```

## TODO
I just refactored the repository so everything is unstable. `express-ws` module is changed to `@clusterws/ws` and I got rid of all the usless pm2 launch buses.
