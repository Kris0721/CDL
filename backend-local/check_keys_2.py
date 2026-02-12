import requests

key = "dtr92Bx4n6wgqFmG7US5cGrvCJhCLp"

endpoints = [
    ("CurrencyAPI.com", f"https://api.currencyapi.com/v3/latest?apikey={key}"),
    ("FastForex", f"https://api.fastforex.io/fetch-all?api_key={key}"),
    ("ExchangeRatesAPI.io", f"http://api.exchangeratesapi.io/v1/latest?access_key={key}"),
    ("FreeCurrencyAPI", f"https://api.freecurrencyapi.com/v1/latest?apikey={key}"),
    ("MetalPriceAPI", f"https://api.metalpriceapi.com/v1/latest?api_key={key}"),
    ("FinancialModelingPrep", f"https://financialmodelingprep.com/api/v3/quote/EURUSD?apikey={key}")
]

print("Testing Currency Key...")
for name, url in endpoints:
    try:
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            print(f"[+] {name}: SUCCESS!")
            print(str(r.json())[:100])
        elif r.status_code == 401:
             print(f"[-] {name}: 401 Unauthorized (Invalid Key)")
        else:
             print(f"[-] {name}: Failed {r.status_code}")
    except Exception as e:
        print(f"[-] {name}: Error {e}")
