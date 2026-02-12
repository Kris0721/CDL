import requests

keys = {
    "crypto": "21911c28d80ccd290da59ebf12059e52",
    "currency": "dtr92Bx4n6wgqFmG7US5cGrvCJhCLp"
}

endpoints = [
    # Crypto Candidates
    ("CoinLayer", f"http://api.coinlayer.com/live?access_key={keys['crypto']}"),
    ("CoinMarketCap", f"https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?CMC_PRO_API_KEY={keys['crypto']}"), # Unlikely format
    ("Fixer (as crypto?)", f"http://data.fixer.io/api/latest?access_key={keys['crypto']}"),
    
    # Currency Candidates
    ("ExchangeRate-API", f"https://v6.exchangerate-api.com/v6/{keys['currency']}/latest/USD"),
    ("CurrencyFreaks", f"https://api.currencyfreaks.com/latest?apikey={keys['currency']}"),
    ("CurrencyLayer", f"http://api.currencylayer.com/live?access_key={keys['currency']}"),
    ("AbstractAPI", f"https://exchange-rates.abstractapi.com/v1/live?api_key={keys['currency']}&base=USD&target=EUR")
]

print("Testing keys...")
for name, url in endpoints:
    try:
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            data = r.json()
            if "error" not in data and "success" in data and not data["success"]:
                 print(f"[-] {name}: Failed (API error: {data['error']})")
            elif "error" in data:
                 print(f"[-] {name}: Failed (API error)")
            else:
                print(f"[+] {name}: SUCCESS!")
                print(str(data)[:100])
        else:
             print(f"[-] {name}: Failed (Status {r.status_code})")
    except Exception as e:
        print(f"[-] {name}: Error {e}")
