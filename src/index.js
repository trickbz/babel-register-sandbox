import _ from 'lodash';

const QueueKey = {
    Queue1: 'queue1',
    Queue2: 'queue2'
};

let state = {
    screens: {
        home: {}
    },
    queries: {
        queue1: [],
        queue2: [],
        currentQueueName: QueueKey.Queue1,
        isScreenDataReady: false,
        isScreenDataFetching: false,
        currentScreenId: 'home'
    }
};

const getOppositeQueueName = () => state.queries.currentQueueName === QueueKey.Queue1 ? QueueKey.Queue2 : QueueKey.Queue1;

class Component {
    constructor(props) {
        this.componentKey = props.componentKey;
        this.dataUrl = props.dataUrl;
        _.bindAll(this, 'processDataUrl', 'processDataUrl', 'render');
        this.processDataUrl();
        this.render();
    }

    processDataUrl() {
        _.forOwn(this.dataUrl, (value, key) => {
            Component.queueQuery(value, key, this.componentKey)
        });
    }

    static queueQuery(url, dataUrlKey, componentKey) {
        const queueName = state.queries.isScreenDataFetching ? getOppositeQueueName() : state.queries.currentQueueName;
        state.queries[queueName].push({
            url,
            dataUrlKey,
            componentKey
        });
    }

    render() {
        console.log(`Rendering ${this.componentKey}...`);
        setTimeout(() => console.log('Done.'), 300);
    }
}

const componentsConfigs = [
    {
        dataUrl: {
            url1: '/api/super-endpoint',
            url2: '/api/mega-endpoint'
        },
        componentKey: 'component-1'
    },
    {
        dataUrl: {
            url1: '/api/super-endpoint',
            url2: '/api/mega-endpoint',
            url3: '/api/mega-endpoint-extra'
        },
        componentKey: 'component-2'
    },{
        dataUrl: {
            url1: '/api/super-endpoint'
        },
        componentKey: 'component-3'
    }
];

const clearQueriesQueue = () => {
    const oppositeQueueName = getOppositeQueueName(state.queries.currentQueueName);
    state.queries[oppositeQueueName] = [];
    state.queries.currentQueueName = oppositeQueueName;
    state.queries.isScreenDataFetching = false;
};

const screenDataFetching = () => {
    state.queries.isScreenDataFetching = true;
    state.queries.isScreenDataReady = false;
};

const screenDataReady = () => {
    state.queries.isScreenDataReady = true;
    state.queries.isScreenDataFetching = false;
};

const loadAggregatedData = (queries) => {
    return queries.map(query => {
        return {
            [query.url]: {
                data: {
                    attributes: {
                        data: [
                            'Some Data 1',
                            'Some Data 2'
                        ]
                    }
                }
            }
        }
    })
};

const storeComponentData = (data) => {
    const currentQueue = state.queries[state.queries.currentQueueName];
    const currentScreenObject = state.screens[state.queries.currentScreenId];
    currentQueue.forEach(query => {
        let currentComponentNode = currentScreenObject[query.componentKey] = (currentScreenObject[query.componentKey] || {});
        Object.assign(currentComponentNode, {
            [query.dataUrlKey]: data
        });
    })
};

const executeQueryQueue = () => {
    screenDataFetching();
    let currentQueue = state.queries[state.queries.currentQueueName];
    const data = loadAggregatedData(currentQueue);
    storeComponentData(data);
    clearQueriesQueue();
    currentQueue = state.queries[state.queries.currentQueueName];
    if (!currentQueue.length) {
        screenDataReady();
    } else {
        executeQueryQueue();
    }
};

_.each(componentsConfigs, componentConfig => {
    new Component(componentConfig);
});
executeQueryQueue();
console.log('break here');