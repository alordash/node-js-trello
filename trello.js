const https = require('https');
const FormData = require('form-data');
const { type } = require('os');

function requestPromise(options, body) {
    options.headers = { 'Content-Type': 'application/json' };
    return new Promise((resolve, reject) => {
        var req = https.request(options, (response) => {
            let chunks_of_data = [];

            response.on('data', (fragments) => {
                chunks_of_data.push(fragments);
            });

            response.on('end', () => {
                let response_body = Buffer.concat(chunks_of_data);
                resolve(response_body.toString());
            });

            response.on('error', (error) => {
                reject(error);
            });
        });
        req.write(JSON.stringify(body));
        req.end();
    });
}

function getPromise(request) {
    return new Promise((resolve, reject) => {
        https.get(request, (response) => {
            let chunks_of_data = [];

            response.on('data', (fragments) => {
                chunks_of_data.push(fragments);
            });

            response.on('end', () => {
                let response_body = Buffer.concat(chunks_of_data);
                resolve(response_body.toString());
            });

            response.on('error', (error) => {
                reject(error);
            });
        });
    });
}

async function getQuery(query) {
    let result;
    try {
        result = JSON.parse(await getPromise(query));
    } catch (error) {
        console.log(error);
    } finally {
        return result;
    }
}

function formDataPromise(formData, options) {
    return new Promise((resolve, reject) => {
        formData.submit(options, (err, response) => {
            let chunks_of_data = [];

            response.on('data', (fragments) => {
                chunks_of_data.push(fragments);
            });

            response.on('end', () => {
                let response_body = Buffer.concat(chunks_of_data);
                resolve(response_body.toString());
            });

            response.on('error', (error) => {
                reject(error);
            });
        });
    });
}

class TrelloManager {
    /**@type {String} */
    key;
    /**@type {String} */
    token;
    /**
     * @param {String} key 
     * @param {String} token 
     */
    constructor(key, token) {
        this.key = key;
        this.token = token;
    }

    /**
     * @param {String} idBoard 
     * @returns {Object}
     */
    GetBoard(idBoard) {
        let query = `https://api.trello.com/1/boards/${idBoard}?lists=open&cards=open&key=${this.key}&token=${this.token}`
        return getQuery(query);
    }

    /**
     * @param {String} idList 
     * @param {String} name 
     * @param {String} description 
     * @param {Number} position 
     * @param {Date} dueDate 
     * @param {String} fileSource 
     * @returns {Object}
     */
    async AddCard(idList, name, description, position, dueDate) {
        const body = {
            idList,
            name,
            desc: description,
            pos: position,
            due: dueDate
        }

        const options = {
            hostname: 'api.trello.com',
            path: `/1/cards?key=${this.key}&token=${this.token}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        }

        let result;
        try {
            result = JSON.parse(await requestPromise(options, body));
        } catch (error) {
            console.log(error);
        } finally {
            return result;
        }
    }

    /**
     * @param {String} cardId 
     * @param {Binary} attachment 
     */
    async AddAttachment(cardId, attachment) {
        const formData = new FormData();
        formData.append('file', attachment);

        const options = {
            hostname: 'api.trello.com',
            protocol: 'https:',
            path: `/1/cards/${cardId}/attachments?key=${this.key}&token=${this.token}`,
            method: 'POST'
        }

        return JSON.parse(await formDataPromise(formData, options));
    }

    /**
     * @param {String} cardId 
     * @param {Boolean} isArchived 
     */
    async ArchiveCard(cardId, isArchived) {
        const body = {
            closed: isArchived
        }

        const options = {
            hostname: 'api.trello.com',
            path: `/1/cards/${cardId}?key=${this.key}&token=${this.token}`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        }

        let result;
        try {
            result = JSON.parse(await requestPromise(options, body));
        } catch (error) {
            console.log(error);
        } finally {
            return result;
        }
    }

    /**
     * @param {String} token 
     */
    GetTokenOwner(token) {
        let query = `https://api.trello.com/1/tokens/${token}/member?key=${this.key}&token=${this.token}`;
        return getQuery(query);
    }

    /**
     * @param {String} userId 
     */
    GetUserBoards(userId) {
        let query = `https://api.trello.com/1/members/${userId}/boards?key=${this.key}&token=${this.token}`;
        return getQuery(query);
    }

    /**
     * @param {String} boardId 
     */
    GetBoardLists(boardId) {
        let query = `https://api.trello.com/1/boards/${boardId}/lists?key=${this.key}&token=${this.token}`;
        return getQuery(query);
    }

    /**
     * @param {String} cardId 
     */
    GetCard(cardId) {
        let query = `https://api.trello.com/1/cards/${cardId}?key=${this.key}&token=${this.token}`;
        return getQuery(query);
    }

    /**
     * @param {String} cardId 
     */
    async DeleteCard(cardId) {
        const options = {
            hostname: 'api.trello.com',
            path: `/1/cards/${cardId}?key=${this.key}&token=${this.token}`,
            method: 'DELETE'
        }

        let result;
        try {
            result = JSON.parse(await requestPromise(options, {}));
        } catch (error) {
            console.log(error);
        } finally {
            return result;
        }
    }
}

module.exports = {
    TrelloManager
}