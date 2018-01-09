# TT API

# Installation

**Install this plugin via the plugins page in the ACP.**

Alternatively:

```
$ cd /path/to/nodebb/node_modules
$ git clone https://github.com/EffCreativeGroup/nodebb-plugin-tickertocker-api-endpoint.git
$ cd nodebb-plugin-tickertocker-api-endpoint
$ npm i

# Then start NodeBB and activate the plugin
```

# API Resources

* [`tt-api/v1` Endpoints](routes/v1/readme.md)

# Authentication

Authentication is handled via HTTP Bearer Token, as generated/specified in the TickerTocker site.

# Error Handling

When the API encounters an error, it will do it's best to report what went wrong. Errors will follow the format specified in this example:

    {
        "code": "not-authorised",
        "message": "You are not authorised to make this call",
        "params": {}
    }
    
# Dependencies

Plugin depends from session-sharing plugin https://github.com/EffCreativeGroup/nodebb-plugin-session-sharing.git
