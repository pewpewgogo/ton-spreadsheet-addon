# TON Spreadsheet Add-on

This is a Google Sheets Add-on that provides functionalities to interact with the TON blockchain, including fetching balances and converting addresses.

## Features:
- Adds a custom menu to Google Sheets.
- Fetches and displays the balance for a given address and ticker.
- Converts TON addresses to different formats.

## How to Use:
1. First deploy https://script.google.com/macros/library/d/1ZtsD9bafVVJtv-uMVfG-DpDB-ZyMATQJWTAFdLaQeWpFMpevaAAiq9Cz/1

## API Configuration:
- The add-on uses an external API to fetch balances.
- Set your API token using the `setUserToken` function. (you can use the default limits)

## Functions:
- `=GET_BALANCE(A1, "TON")`: Fetches the balance for a given address and ticker. ("TON", "NOT", "USDT")
- `=CONVERT_ADDRESS(A1, "raw")`: Converts a TON address to the specified format. (r|b|u)

## License:
This project is licensed under the MIT License.