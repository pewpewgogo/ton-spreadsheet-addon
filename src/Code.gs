function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Add-on Menu')
    .addItem('Set API Token', 'showTokenDialog')
    .addToUi();
}

function showTokenDialog() {
  const html = HtmlService.createHtmlOutputFromFile('TokenDialog')
    .setWidth(300)
    .setHeight(200);
  SpreadsheetApp.getUi().showModalDialog(html, 'Set API Token');
}

function GET_BALANCE(address, ticker) {
  return getBalanceForAddress(address, ticker);
}

function CONVERT_ADDRESS(address, format) {
  return convertAddress(address, format);
}