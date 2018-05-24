# `tt-api/v1` Endpoints

**Note**: `Authentication` is handled via HTTP Bearer Token, as generated/specified in the TickerTocker site.

* `/tt-api/v1`
    * `/users`
        * `POST /`
            * Creates a new user
            * **Requires**: 
                * `externalUserId` - tickertocker ID, 
                * `externalUserRole` - tickertocker ROLE_ID, 
                * `username`, 
                * `email` 
            * **Accepts**: `fullname`, `website`, `password`, `aboutme`, `picture`
            * _(Bearer authorization token is required)_
        * `PUT /`
            * Update data of user
            * **Requires**: 
                * `externalUserId` - tickertocker ID
            * **Accepts**: `username`, `email`, `externalUserRole`, `fullname`, `website`, `aboutme`, `picture`
            * _(Bearer authorization token is required)_
        * `DELETE /`
            * Delete user
            * **Requires**: 
                * `externalUserId` - tickertocker ID
            * _(Bearer authorization token is required)_
        * `/ban`
            * `POST /`
                * ban user
                * **Requires**: 
                    * `externalUserId` - tickertocker ID
                * _(Bearer authorization token is required)_
            * `DELETE /`
                * unban user
                * **Requires**: 
                    * `externalUserId` - tickertocker ID
                * _(Bearer authorization token is required)_
