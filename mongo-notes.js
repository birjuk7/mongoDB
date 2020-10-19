// MONGO COMMAND LINE
// start mongod
ulimit -n 2048 && mongod
// ctrl-c ends in same window, but can also use
killall mongod
// start mongod with data directory in another location
mongod -dbpath /path/to/data/dir
// open command line interface (mongo shell)
mongo
// restore a DB dump from a binary (BSON) dump file
mongorestore dumpFileName
// restore a DB dump from a JSON dump file
mongoimport -d dbName -c collectionName dumpFileName.json

// CREATING DOCUMENTS
// see what DBs are available
show dbs
// show currently selected DB
db
// select a DB to use, even if it does not exist
use dbName
// see what collections are available within selected DB
show collections
// as with the DB, a new collection is created just by referring to it
db.collectionName.insertOne({"key1":"value1", "key2":"value2"})
db.collectionName.insertMany([{}, {}, {}])
db.collectionName.insertMany([{}, {}, {}], {ordered:false})

// DELETING DOCUMENTS
// remove all records
db.collectionName.remove({})
// remove a specific (set of) record(s)
db.collectionName.remove({"key":"value"})
// remove just one record
db.collectionName.remove({"key":"value"}, {justOne:true})
// remove all records and delete collection from collections list
db.collectionName.drop()
// delete an entire DB
use dbName
db.dropDatabase()

// READING DOCUMENTS
// find the first record in the collection
db.collectionName.findOne()
// first argument to find is called the "query document", which can have one or more fields (selectors) to restrict the result set
db.collectionName.find({"key":"value1", "key.nested":"value2"})
db.collectionName.find({}).count()
db.collectionName.find({}).pretty()
// document queries can also search for an array of results, in this case an exact match of two values
// order matters, will only find documents with value1 & value2 && in that order, this happens because search values are enclosed in an array
db.collectionName.find({"key":["value1", "value2"]})
// when searching array, find a value at a specific spot (element) in the array (in this case, the first element in the array)
db.collectionName.find({"key.0":"value1"})

// CURSORS
var c = db.collectionName.find({"key":"value"})
c.hasNext()  // boolean stating whether or not there are more documents in the cursor
c.next()  // displays the next document in the cursor
c.objsLeftInBatch()  // show how many objects are left in batch
var doc = function() {return c.hasNext() ? c.next() : null;}  // nice doc() function to display next document in batch

// PROJECTION
db.collectionName.find({"key":"value"},{"key2":1})  // projection to limit data sent back for query results (in this case, only key2 is returned)
db.collectionName.find({"key":"value"},{"key2":1, "_id":0})  // and leave out the _id

//COMPARISON OPERATORS
// $eq, $gt, $lt, $gte, $lte, $ne, $in, $nin
db.collectionName.find({"key":{$gt:100}})  // find key value > 100
// ranges can also be specified
db.collectionName.find({"key":{$gt:100, $lt:150}})  // find key value > 100 and < 150
// or different field search values
db.collectionName.find({"key1":{$gte:30}, "key2":{$gte:80}})
// the $ne comparison operator returns all documents with fields != to the value specified && without that field at all
db.collectionName.find({"key":{$ne:"something"}})
// the $in comparison operator returns all documents with fields == to one of the values specified in the array of values
db.collectionName.find({"key":{$in:["caseA", "caseB", "caseC"]}})

// ELEMENT OPERATORS
// $exists, $type
db.collectionName.find({"key":{$exists:true}})
db.collectionName.find({"key":{$type:"string"}})
// numeric values also exist for the $type BSON equivalents, see:
// https://docs.mongodb.org/v3.0/reference/operator/query/type/

// LOGICAL OPERATORS
// $or, $and, $not, $nor
db.collectionName.find({$or:[{"key1":{$gt:90}}, {"key2":{$gt:80}}]})
// $and is sometimes superfluous. this query:
db.collectionName.find({$and:[{"key1":{$gt:90}}, {"key2":{$gt:80}}]})
// is the same as this one:
db.collectionName.find({"key1":{$gt:90}, "key2":{$gt:80}})
// $and is used to specify multiple constraints on the same key
db.collectionName.find({$and:[{"key1":{$ne:null}}, {"key1":{$exists:true}}]})

// REGEX OPERATOR
// $regex
db.collectionName.find({"key1":{$regex:/^Text\s.*/}})

// ARRAY OPERATORS
// $all, $elemMatch, $size
db.collectionName.find({"key1": {$all: ["caseA", "caseB", "caseC"]}})
// $size enables matching based on the length of an array
db.collectionName.find({"key1": {$size: 2}})
/*
 * $elemMatch is used for documents with a field with an array that hold embedded documents within it
 * key1: [ {"key1a": "caseA1", "key1b": "caseA2"},
 *         {"key1a": "caseB1", "key1b": "caseB2"} ]
*/
db.collectionName.find({"key1": {"key1a": "value", "key1a2": {$gt: 10}}})
// above will not find a specific embedded document that matches both criteria,
// it will just find an array where the criteria are matched in any combination of the fields in the embedded documents
db.collectionName.find({"key1": {$elemMatch: {"key1a": "value", "key1a2": {$gt: 10}}}})
// $elemMatch ensures all criteria are matched within a single element of an array field

// UPDATING DOCUMENTS
// updateOne(), updateMany(), replaceOne()
// first specify a filter/selector document (key), then specify how with an update operator ($set)
db.collectionName.updateOne({"key":"value"}, {$set: {"key2": "value2"}})

// FIELD UPDATE OPERATORS
// $set, $unset, $inc, $mul, $rename, $setOnInsert, $min, $max, $currentDate
db.collectionName.updateOne({"key":"value"}, {$inc: {"key2": 3, "key3": 101}})
// more info: https://docs.mongodb.org/v3.2/reference/operator/update/

// ARRAY FIELD UPDATE
db.collectionName.updateOne({"key":"value"}, {$push: {"key2": {"key2a": "caseA", "key2b": 55}}})
// use $each when pushing multiple 
db.collectionName.updateOne({"key":"value"}, {$push: {"key2": {$each: [{"key2a": "caseA", "key2b": 55}, {"key2a": "caseB", "key2b": 76}]}}})
// $slice can be used with $push and $each to trim down the array to the first set of records
// $position is needed to ensure inserted value goes to the front of the array rather than the end
db.collectionName.updateOne({"key":"value"}, {$push: {"key2": {$each: [{"key2a": "caseC", "key2b": 34}], $position: 0, $slice: 5}}})

// REMOVE NULL FIELDS FROM DOCUMENTS IN A COLLECTION
db.collectionName.updateMany({"key":null}, {$unset{"key":""}})

// UPSERT
db.collectionName.updateOne({"key":"value"}, {$set: {"key2":"value2"}}, {upsert: true})

// REPLACE ONE
db.collectionName.replaceOne({"key":detail.key}, detail)
// where detail is a variable containing all document information (key/value pairs) for the operation

/*
 * INDEXES
 */

// EXPLAIN
// shows how the database does what is requested of it
db.collectionName.explain().find({"key":"value"})
// use the "true" argument also run the query and show metrics on results
db.collectionName.explain(true).find({"key":"value"})
// create an explainable object to simplify queries from mongo shell
var exp = db.collectionName.explain()
exp.find({"key":"value"})
exp.find({"key":"value"}).sort({"key":-1})
// explain() runs in queryPlanner mode by default
// can also be run in executionStats and allPlansExecution modes
var exp = db.collectionName.explain("executionStats")
var exp = db.collectionName.explain("allPlansExecution")

// ADD INDEX
db.collectionName.createIndex({"key":1})
// 1 means ascending order

// ADD COMPOUND INDEX
db.collectionName.createIndex({"key1":1, "key2":-1})
// when building compound indexes, following this pattern:
// equality fields first, then sort fields, then range fields

// LIST INDEXES
db.collectionName.getIndexes();

// DELETE INDEX
db.collectionName.dropIndex({"key":1})

// MULTIKEY INDEXES
// created when one of the keys of an index is an array
// can't have a compound index where both keys in a single document are arrays (only one array per document per compound index)

// MULTIKEY INDEXES & DOT NOTATION
// create index with a key and sub-key (dot notation)
db.collectionName.createIndex({"keys.key":-1});
// find command with a key and sub-key
db.collectionName.find({"keys.key":{$gt:99}})
// find docs with an array element set to a value (keys:key1 has key2 > 99)
db.collectionName.find({"keys":{$elemMatch:{"key1":"value", "key2":{$gt:99}}}})

// UNIQUE INDEXES
db.collectionName.createIndex({"key":1}, {unique:true})
// can't create if there are already duplicate key values; inserting a duplicate key value afterward gives an error (E11000)

// SPARSE INDEXES
// create a sparse index on a unique but optional key (i.e., not all records will have that key)
db.collectionName.createIndex({"key":1}, {unique:true, sparse: true})

// BACKGROUND INDEX CREATION
// enables readers/writers to collection while index is being created
db.collectionName.createIndex({"key":1}, {background: true})

// INDEX SIZE
// get the size of the indexes for a collection
db.collectionName.stats()
db.collectionName.totalIndexSize()

// GEOSPATIAL INDEX
// set up an index based on location/coordinates in 2 dimensions [x, y]
db.collectionName.createIndex({"location":"2d"})
// can also be part of a compound index
db.collectionName.createIndex({"location": "2d", "storeType": "grocery"})
// use $near operator in find() queries, limit to first 10
db.collectionName.find({"location":{$near:[x,y]}}).limit(10)

// GEOSPATIAL SPHERICAL INDEX
// used with longitude and latitude - see geojson.org for details
db.collectionName.createIndex({"location": "2dsphere"})
// searching with find involves a few more variables (maxDistance in meters)
db.collectionName.find({"location": {$near: {$geometry: {type: "Point", coordinates: [long,lat]}, $maxDistance: 2000}}})

// TEXT INDEX
db.collectionName.createIndex("words": "text")
db.collectionName.find({$text: {$search: "keyword1 keyword2"}})
// find the best ranked match for the keywords searched
db.collectionName.find({$text: {$search: "keyword1 keyword2"}}, {score:{$meta:"textScore"}}).sort({score:{$meta:"textScore"}})

/*
 * PROFILING
 */

// log slow queries by specifying level of detail (0-none, 1-slow only, 2-all) and millisecond threshold
mongod --profile 1 --slowms 20
// then run query, the in mongo shell
db.system.profile.find()
// find queries longer than 1000ms and sort in reverse order by timestamp
db.system.profile.find({millis:{$gt:1000}}).sort({ts:-1})
// get current profiling level from the shell
db.getProfilingLevel()
db.getProfilingStatus()
// and set it from the shell
db.setProfilingLevel(1, 40)

/*
 * AGGREGATION
 */

// simple aggregation query with match stage
db.collectionName.aggregate([{$match:{"key":"value"}}])
// with projection stage added
db.collectionName.aggregate([{$match:{"key":"value"}}, {$project{"_id":0, "key1":1, "key2":1}}])
// pipeline is an array with one or more documents stipulating different stages
// with limit stage added
db.collectionName.aggregate([{$match:{"key":"value"}}, {$limit: 5}, {$project{"_id":0, "key1":1, "key2":1}}])
// more efficient to run limit in front of project to avoid projection through a large amount of documents only to return a few
// with sort stage added
db.collectionName.aggregate([{$match:{"key":"value"}}, {$sort {"key":1}}, {$limit: 5}, {$project{"_id":0, "key1":1, "key2":1}}])
// with skip stage added
db.collectionName.aggregate([{$match:{"key":"value"}}, {$sort {"key":1}}, {$skip: 10}, {$limit: 5}, {$project{"_id":0, "key1":1, "key2":1}}])

// finish notes from "Reshaping Documents in $project Stages" onwards