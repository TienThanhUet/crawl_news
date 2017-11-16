var workforce = require('workforce');
var manager = workforce('./app');
manager.set('workers', 4);
manager.set('title', 'Notes');
manager.set('restart threshold', '5s');
manager.set('exit timeout', '20s');
manager.listen(process.env.PORT || 3000);