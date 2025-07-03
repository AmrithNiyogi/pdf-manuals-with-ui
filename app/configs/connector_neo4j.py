import aiohttp
from app.utils.logging_utils import setup_logger
from .settings import settings

logger = setup_logger(__name__)

URI = f"{settings.NEO4J_URL}/db/{settings.NEO4J_DATABASE}/tx/commit"
session = None

async def start_session():
    global session
    if session is None:
        auth = aiohttp.BasicAuth(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        session = aiohttp.ClientSession(auth=auth)
        logger.info("Started aiohttp Neo4j session")

async def send_request(cypher: str):
    global session
    query = {"statements": [{"statement": cypher}]}
    if session is None:
        await start_session()
    try:
        async with session.post(URI, json=query) as response:
            logger.debug(f"Sending raw Cypher: {cypher}")
            return await response.json()
    except aiohttp.ClientError as e:
        logger.error(f"Neo4j request error: {e}")
        return None

async def send_request_with_params(cypher: str, parameters: dict):
    global session
    query = {"statements": [{"statement": cypher, "parameters": parameters}]}
    if session is None:
        await start_session()
    try:
        async with session.post(URI, json=query) as response:
            logger.debug(f"Sending Cypher with parameters: {cypher} | {parameters}")
            response_data = await response.json()
            return await process_response(response_data)
    except aiohttp.ClientError as e:
        logger.error(f"Neo4j connection error: {e}")
        return None

async def execute_cypher(cypher: str, parameters: dict = None):
    if parameters is None:
        parameters = {}
    response = await send_request_with_params(cypher, parameters)
    if response:
        return await process_response(response)
    else:
        logger.error("No response received from Neo4j for execute_cypher")
        return {'status': 'Connection Error', 'response': 'No response due to connection failure.'}

async def execute_cypher_generic_cyphers(cypher: str, parameters: dict = None):
    if parameters is None:
        parameters = {}
    response = await send_request_with_params(cypher, parameters)
    if response:
        return await process_response_generic_cyphers(response)
    else:
        logger.error("No response received from Neo4j for execute_cypher_generic")
        return {'status': 'Connection Error', 'response': 'No response due to connection failure.'}

async def process_response(response: dict):
    try:
        if 'results' in response and len(response['results']) > 0 and 'data' in response['results'][0]:
            result = []
            for data in response['results'][0]['data']:
                row = data['row'][0]
                if isinstance(row, dict) and 'embedding' in row:
                    row.pop('embedding')
                result.append(row)
            logger.info("Processed response successfully with %d rows", len(result))
            return result
        else:
            logger.warning(f"Unexpected response structure: {response}")
            return {"details": response}
    except (KeyError, TypeError, IndexError) as e:
        logger.exception(f"Error processing Neo4j response: {e}")
        return {"details": str(e)}

async def process_response_generic_cyphers(response: dict):
    try:
        if not response:
            logger.warning("Empty response received in process_response_generic")
            return []

        if isinstance(response, list):
            if all(isinstance(r, str) for r in response):
                return response

            if all(isinstance(r, dict) for r in response):
                result = []
                for record in response:
                    if "keys" in record and "_fields" in record:
                        result.append(dict(zip(record["keys"], record["_fields"])))
                    else:
                        result.append(record)
                logger.info("Processed generic dict-style response with %d records", len(result))
                return result

            if all(isinstance(r, dict) and "keys" in r and "_fields" in r for r in response):
                result = [dict(zip(r["keys"], r["_fields"])) for r in response]
                logger.info("Processed structured Neo4j records with %d items", len(result))
                return result

            if all(isinstance(r, list) for r in response):
                logger.info("Processed response as list-of-lists format")
                return response

        logger.warning(f"Unrecognized response format: {type(response)}")
        return response

    except Exception as e:
        logger.exception(f"process_response_generic failed: {e}")
        return {"error": str(e)}
