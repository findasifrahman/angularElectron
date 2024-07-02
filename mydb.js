const ADODB = require('node-adodb');
let str = 'Provider=Microsoft.ACE.OLEDB.12.0;Data Source=bijoy50.accdb;Persist Security Info=False;'
const connection = ADODB.open(str)//('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=node-adodb.mdb;');

connection
  .query('SELECT * FROM chatdata')
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error(error);
  });

  
 
