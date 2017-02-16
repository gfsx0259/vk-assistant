module.exports = {
    'messages.get': [],
    'messages.getDialogs' : ['offset'],
    'messages.send' : ['user_id', 'message'],
    'users.get' : ['fields', 'user_ids'],
    'messages.getLongPollServer': [],
    'messages.getLongPollHistory': ['ts', 'key', 'wait', 'act', 'mode']
};