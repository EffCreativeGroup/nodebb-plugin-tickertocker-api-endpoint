# `tt-api/v1` Endpoints

**Note**: `Authentication` is handled via HTTP Bearer Token, as generated/specified in the TickerTocker site.

* `/tt-api/v1`
    * `/users`
        * `POST /`
            * Creates a new user
            * **Requires**: 
                * `TTUserId` - tickertocker ID, 
                * `TTRole` - tickertocker ROLE_ID, 
                * `username`, 
                * `email` 
            * **Accepts**: `fullname`, `website`, `password`
            * _(Bearer authorization token is required)_
        * `PUT /`
            * Update data of user
            * **Requires**: 
                * `TTUserId` - tickertocker ID
            * **Accepts**: `username`, `email`, `TTRole`, `fullname`, `website`
            * _(Bearer authorization token is required)_
        * `DELETE /`
            * Delete user
            * **Requires**: 
                * `TTUserId` - tickertocker ID
            * _(Bearer authorization token is required)_
        * `/ban`
            * `POST /`
                * ban user
                * **Requires**: 
                    * `TTUserId` - tickertocker ID
                * _(Bearer authorization token is required)_
            * `DELETE /`
                * unban user
                * **Requires**: 
                    * `TTUserId` - tickertocker ID
                * _(Bearer authorization token is required)_
