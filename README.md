# AWS URL Shortener

URL shortener function to be used for AWS lambda service, connected to a dynamo DB database.

## Sample request:

1. POST request to shorten a url:

- URL: https://cy3ipb9423.execute-api.us-east-1.amazonaws.com/Prod/shorten
- body: {"longUrl": "url-to-shorten"}

* sample response: {
  "Operation": "SAVE",
  "Message": "SUCCESS",
  "Item": {
  "urlCode": "\_FpEWsP49",
  "longUrl": "url-to-shorten"
  }
  }

2. GET request to go from short url to long url:

- URL: https://cy3ipb9423.execute-api.us-east-1.amazonaws.com/Prod/{urlCode}
