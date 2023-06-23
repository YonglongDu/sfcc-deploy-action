# SFCC Deploy Action

The Github action helps you deploy your SFCC code into Salesforce Commerce Cloud sandbox with [sfcc-ci](https://github.com/SalesforceCommerceCloud/sfcc-ci).

## Usage

### Add following secrets in your respository

Refer [Add an API Client](https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/content/b2c_commerce/topics/account_manager/b2c_account_manager_add_api_client_id.html) section for further details about how to get below informations.

-   `SFCC_SANDBOX_API_HOST` set alternative sandbox API host
-   `SFCC_OAUTH_CLIENT_ID` client id used for authentication
-   `SFCC_OAUTH_CLIENT_SECRET` client secret used for authentication

In order to deploy your code to sandbox, you need to [grant your API key access to your instance](https://github.com/SalesforceCommerceCloud/sfcc-ci#grant-your-api-key-access-to-your-instances) firstly.

### Deploy your cartridges with this Github action

```yaml
- name: deploy
    uses: YonglongDu/sfcc-deploy-action@main
    with:
        instance: ${{ secrets.SFCC_SANDBOX_API_HOST }}
        client-id: ${{ secrets.SFCC_OAUTH_CLIENT_ID }}
        client-secret: ${{ secrets.SFCC_OAUTH_CLIENT_SECRET }}
        code-version: action-test_${{github.run_number}}
```
