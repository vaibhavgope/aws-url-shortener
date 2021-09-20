const AWS = require('aws-sdk')
const shortId = require('shortid')

AWS.config.update({
    region: 'us-east-2'
})

const dynamodb = new AWS.DynamoDB.DocumentClient()
const dynamodbTableName = process.env.awsDBName
const shortenPath = '/shorten'
const healthPath = '/health'
const redirectPath = '/{code}'

exports.handler = async function (event, context, callback) {
    console.log("Event: ", event)
    let resp
    switch (true) {
        case event.httpMethod === 'GET' && event.path === healthPath:
            resp = createResponse(200)
            break;
        case event.httpMethod === 'GET' && event.resource === redirectPath:
            resp = await handleRedirect(event.pathParameters.code, callback)
            break;
        case event.httpMethod === 'POST' && event.path === shortenPath:
            const body = JSON.parse(event.body)
            resp = await createShortPath(body.longUrl)
            break;
        default:
            resp = createResponse(404, 'Not Found, please check the url and params.')
            break;
    }
    return resp
}

async function createShortPath(url) {
    const params = {
        TableName: dynamodbTableName,
        Key: {
            'longUrl': url
        }
    }
    const found = await dynamodb.get(params)
    if (found?.Item) {
        return createResponse(200, found.Item)
    } else {
        const shortCode = shortId.generate()
        const newItem = {
            urlCode: shortCode,
            longUrl: url
        }
        const save_params = {
            TableName: dynamodbTableName,
            Item: newItem
        }
        return await dynamodb.put(save_params).promise().then(() => {
            const body = {
                Operation: 'SAVE',
                Message: 'SUCCESS',
                Item: newItem
            }
            return createResponse(200, body)
        }, (error) => {
            console.error('Failed to create new item', error)
        })
    }
}

async function handleRedirect(code, callback) {
    const params = {
        TableName: dynamodbTableName,
        Key: {
            'urlCode': code
        }
    }
    const item = await dynamodb.get(params).promise()
    console.log('item =', item?.Item);
    if (item?.Item) {
        const response = {
            statusCode: 301,
            headers: {
                Location: item.Item.longUrl
            }
        }
        return callback(null, response)
    } else return createResponse(404, 'Url not found')
}

function createResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }
}

