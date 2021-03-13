# ![](https://raw.githubusercontent.com/hoobs-org/HOOBS/master/docs/logo.png)

The HOOBS server daemon is the software that creates and runs bridge bridges.


## Installing
First add the HOOBS repository to your sources.

```sh
wget -qO- https://support.hoobs.org/setup | sudo -E bash -
```

Now you can install hoobsd and the HOOBS CLI.

```sh
sudo apt install -y hoobsd hoobs-cli
```

## Usage
To start using HOOBS you will first need to initilize the system.

```
sudo hbs install
```

You will be asked to set a port. Then if you have systemd or launchd on the system this will automatically set this up to run on start.

## Documentation
The hoobsd CLI & API documentation can be found here.  
[CLI Documentation](https://github.com/hoobs-org/HOOBS/blob/development/docs/CLI.md)  
[API Documentation](https://github.com/hoobs-org/HOOBS/blob/development/docs/API.md)  

## Legal
HOOBS and the HOOBS logo are registered trademarks of HOOBS Inc. Copyright (C) 2020 HOOBS Inc. All rights reserved.
