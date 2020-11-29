const {ApolloServer, gql} = require('apollo-server');
const sqlite3 = require('sqlite3').verbose();
const { open } = require("sqlite");
var db;
(async()=>{
	db = await open({
		filename:'C:/Users/Dokyy-PC/Desktop/html.css.js и другие демоны/sirius/backend/II - advanced/db/database.db', // need absolute path to .db file
		driver:sqlite3.Database
	})
})();

const typeDefs = gql`
interface OperationResult {
	code: Int!
	success: Boolean!
}
type AddUserOperationResult implements OperationResult {
	code: Int!
	success: Boolean!
	addID: Int!
	addedUser: User
}
type DeleteUserOperationResult implements OperationResult {
	code: Int!
	success: Boolean!
	deleteID: Int!
	deletedUser: User
}
type UpdateUserOperationResult implements OperationResult {
	code: Int!
	success: Boolean!
	updateID: Int!
	updatedUser: User
}
type AddPostOperationResult implements OperationResult {
	code: Int!
	success: Boolean!
	postID: Int!
	addedPost: Post
}
type UpdatePostOperationResult implements OperationResult {
	code: Int!
	success: Boolean!
	postID: Int!
	updatedPost: Post 
}
type DeletePostOperationResult implements OperationResult {
	code: Int!
	success: Boolean!
	postID: Int!
}
type AddCommentOperationResult implements OperationResult {
	code: Int!
	success: Boolean!
	commentId: Int!
	addedComment: Comment
}
type UpdateCommentOperationResult implements OperationResult {
	code: Int!
	success: Boolean!
	commentId: Int!
	updatedComment: Comment
}
type DeleteCommentOperationResult implements OperationResult {
	code: Int!
	success: Boolean!
	commentId: Int!
	deletedComment: Comment
}
type User {
	id: ID!
	fname: String!
	lname: String!
	email: String!
	avatar: String
}
type Comment {
	id: ID!
	author: User!
	postId: Int!
	replies: [Comment]
	content: String!
	date: String!
	replyto: Int
}
type Post {
	id: ID!
	author: User!
	title: String!
	content: String!
	date: String!
	comments: [Comment]
}
type Query {
	#users
	allUsers: [User]
	userByID(id: Int!): User
	#posts
	allPosts: [Post]
	getPostByID(id: Int!): Post
	#comments
	getPostComments(postid: Int!): [Comment]
	getCommentReplies(commentId: Int!): [Comment]
}
type Mutation {
	#users
	addUser(fname: String!, lname: String!, email: String!, avatar: String): AddUserOperationResult
	deleteUser(id: Int!): DeleteUserOperationResult
	updateUser(id: Int! fname: String, lname: String, email: String, avatar: String): UpdateUserOperationResult
	#posts
	addPost(title: String!, content: String!, authorid: ID!): AddPostOperationResult
	updatePost(postid: Int!,updaterID: Int!, title: String, content: String): UpdatePostOperationResult
	deletePost(postid: Int!, deleterID: Int!): DeletePostOperationResult
	#comments
	addComment(authorid: Int!, content: String!, postid: Int!, replyToCommentId: Int): AddCommentOperationResult
	updateComment(id: Int!, updaterId: Int!, content: String!): UpdateCommentOperationResult
	deleteComment(id: Int!, deleterId: Int!): DeleteCommentOperationResult
}
`;//a
class User {
	constructor(id,fname,lname,email,avatar) {
		this.id=id;
		this.fname=fname;
		this.lname=lname;
		this.email=email;
		this.avatar=avatar;
		return this;
	}
}
class Post {
	constructor(id,author,title,content,date) {
		this.id=id;
		this.author=author;
		this.title=title;
		this.content=content;
		this.date=date;
	}
}
async function getRowById(id,row){
	if (!row || !id)
		return;
	return await db.get(`SELECT * FROM ? WHERE id = ${id}`,[row]);
}
async function getUserById(id) {
	return await db.get(`SELECT * FROM users WHERE id = ${id}`);
}
async function getCommentReplies(comid) {
	let reps = await db.all(`SELECT * FROM comments WHERE replyto = '${comid}'`);
	for (let rep of reps) {
		rep.author = getUserById(rep.authorid);
	}
	return reps;
}
async function getPostComments(postid) {
	let coms = await db.all(`SELECT * FROM comments WHERE postid = ${postid}`);
	let i = 0;
	for (let com of coms) {
		coms[i].author = getUserById(com.authorid);

		let reps = await db.all(`SELECT * FROM comments WHERE replyto = ?`,[com.id]);
		coms[i].replies = reps ? reps : null;
		i++;
	}
	return coms;

}
String.prototype.reverse = function() {
	let result = "";
	for (var i = this.length-1; i >= 0; i--) {
		result += this[i];
	}
	return result;
};
const resolvers = {
	OperationResult: {
		__resolveType(operation,context,info) {
			//users
			if (operation.addID && (operation.addedUser || operation.addedUser === null)) {
				return "AddUserOperationResult";
			}
			if (operation.deleteID && (operation.deletedUser || operation.deletedUser === null)) {
				return "DeleteUserOperationResult";
			}
			if (operation.updateID && (operation.updatedUser || operation.updatedUser === null)) {
				return "UpdateUserOperationResult";
			}
			//posts
			if (operation.addID && (operation.addedPost || operation.addedPost === null)) {
				return "AddPostOperationResult";
			}
			if (operation.updateID && (operation.updatedPost || operation.updatedPost === null)) {
				return "UpdatePostOperationResult";
			}
			if (operation.deleteID && (operation.deletedPost || operation.deletedPost === null)) {
				return "DeletePostOperationResult";
			}
			// comms
			if (operation.addedComment || operation.addedComment === null) {
				return "AddCommentOperationResult";
			}
			if (operation.updatedComment || operation.updatedComment === null) {
				return "UpdateCommentOperationResult";
			}
			if (operation.deletedComment || operation.deletedComment === null) {
				return "DeleteCommentOperationResult";
			}
		}
	},
	Query: {
		// users
		allUsers: async () => {
			let result = await db.all(`SELECT * FROM users`);
			return [...Object.values(result)];
		},
		userByID: async (w,args) => {
			let result = await db.get(`SELECT * FROM users WHERE id = ${args.id}`);
			return new User(...Object.values(result));
		},
		//posts
		allPosts: async () => {
			let posts = await db.all(`SELECT * FROM posts`);
			let i=0;
			for (let post of posts) {
				let author = await db.get(`SELECT * FROM users WHERE id = '${post.authorid}'`);
				let comments = await getPostComments(post.id);
				posts[i].author = author;
				posts[i].comments = comments;
				i++;
			}
			return posts;
		},
		getPostByID: async (w,args) => {
			let result = await db.get(`SELECT * FROM posts WHERE id = ${args.id}`);
			let comments = getPostComments(null,args.id);
			let author = await getUserById(result.authorid);
			result.author = author;
			result.comments =await getPostComments(args.id);
			console.dir(result);
			if (!result){
				throw "No such post with this ID";
			}
			return result;
		},
		getPostComments:async (w,args)=> {
			let coms = await db.all(`SELECT * FROM comments WHERE postid = ${args.postid}`);
			let i = 0;
			for (let com of coms) {
				coms[i].author = getUserById(com.authorid);

				let reps = await db.all(`SELECT * FROM comments WHERE replyto = ?`,[com.id]);
				coms[i].replies = reps ? reps : null;
				i++;
			}
			return coms;
		},
		getCommentReplies:async(w,args)=> {
			let reps = await db.all(`SELECT * FROM comments WHERE replyto = ?`,[args.commentId]);
			let i = 0;
			for (let rep of reps) {
				reps[i].author = getUserById(rep.authorid);
				i++;
			}
			return reps
		}
	},
	Mutation: {
		//users
		addUser:async function(w,args) {
			let res = await db.run(`INSERT INTO users(fname, lname, email, avatar) VALUES('${args.fname}','${args.lname}','${args.email}',${args.avatar ? `'${args.avatar}'` : 'NULL'})`);
			let _added = await db.get(`SELECT * FROM users WHERE id = ${res.lastID}`);
			if (!res.changes) {
				return {code:400,success:false}
			}
			console.log(_added);
			return {
				code:200,
				success:true,
				addID:res.lastID,
				addedUser:_added
			};
		},
		deleteUser: async(w,args) => {
			let result = await db.run(`DELETE FROM users WHERE id = ${args.id}`);
			let postdelete = await db.run(`DELETE FROM posts WHERE authorid = ?`,[args.id]);
			let commdelete = await db.run(`DELETE FROM comments WHERE authorid = ?`,[args.id]);
			if (result.changes+commdelete+postdelete) {
				return {code:200, success:true, deleteID:args.id, deletedUser: await db.get(`SELECT * FROM users WHERE id = ${args.id}`)};
			}
			else {
				return {code:400, success:false, deleteID:args.id, deletedUser:null};
			}
		},
		updateUser: async(w,args) => {
			let fname,lname,email,avatar;
			if (!args.fname)
				fname = "";
			else 
				fname = `fname = '${args.fname}',`;
			if (!args.lname) 
				lname = "";
			else
				lname = `lname = '${args.lname}',`;
			if (!args.email) 
				email = "";
			else
				email = `email = '${args.email}',`;
			if (!args.avatar)
				avatar = "";
			else 
				avatar = `avatar = '${args.avatar}'`;
			let upd = await db.run(`UPDATE users SET ${fname}${lname}${email}${avatar} WHERE id = ${args.id}`.replace(", "," "));
			if (!upd.changes) {
				return {
					code:400,
					success:false,
					updateID:args.id,
					updatedUser:null
				}
			}
			let updatedUser = await db.get(`SELECT * FROM users WHERE id = ${args.id}`);
			return {
				code:200,
				success:true,
				updateID:args.id,
				updatedUser:updatedUser
			}
		},
		//posts
		addPost: async(w,args)=> {
			let queryAuthor = await db.get(`SELECT * FROM users WHERE id = ?`,[args.authorid]);
			if (!queryAuthor) {
				throw "No such user with this userid!";
			}
			let nowdate = new Intl.DateTimeFormat('ru').format(Date.now());
			let res = await db.run(`INSERT INTO posts(authorid,title,content,date) VALUES('${args.authorid}','${args.title}','${args.content}','${nowdate}')`);
			if (!res.changes) {
				return {
					code:400,
					success:false,
					postID:args.id,
					updatedUser:null
				}
			}
			
			let queryPost = await db.get(`SELECT * FROM posts WHERE id = ${res.lastID}`);
			queryPost.author = queryAuthor;
			queryPost.date = nowdate
			//console.dir(queryPost);
			return {
				code:200,
				success:true,
				postID:res.lastID,
				addedPost: queryPost
			}
		},
		updatePost: async(w,args) => {
			let  post = await resolvers.Query.getPostByID(null,{id:args.postid});
			debugger;
			if (args.updaterID != post.authorid) {
				return {
					code:403,
					success:false,
					postID:args.postid,
					updatedPost:null
				}
			}
			let content,title; content = title = "";
			if (args.title)
				title = `title = '${args.title}',`;
			if (args.content) 
				content = `content = '${args.content}'`;
			console.log(`UPDATE posts SET ${title}${content} WHERE id = ${args.postid}`.replace(", "," "))
			let result = await db.run(`UPDATE posts SET ${title}${content} WHERE id = ${args.postid}`.replace(", "," "));
			let updated = await resolvers.Query.getPostByID(null,{id:args.postid});

			if (!result.changes) {
				return {code:400, success:false}
			}
			return {
				code:200,
				success:true,
				postID:args.postid,
				updatedPost:updated
			}

		},
		deletePost: async(w,args) => {
			let query = `SELECT authorid FROM posts WHERE id = ${args.postid}`;
			//console.log(query)
			let post = await db.get(query);
			if (!post) {
				return {
					code:400,
					success:false,
					postID:args.postid
				}
			}
			if (args.deleterID != post.authorid) {
				return {
					code:403,
					success:false,
					postID:args.postid,
				}
			}
			let result = await db.run(`DELETE FROM posts WHERE id = ${args.postid}`);
			let resultComms = await db.run(`DELETE FROM comments WHERE postid = ?`,[args.postid]);
			if (!result.changes ) {
				return {
					code:400,
					success:false,
					postID:args.postid,
				}
			}
			return {
				code:200,
				success:true,
				postID:args.postid,
			}
		},
		//comments
		addComment: async(w,args) => {
			let date = new Intl.DateTimeFormat('ru').format(Date.now());
			console.log(date); 
			let res = await db.run(`INSERT INTO comments(authorid,postid,content,date,replyto) VALUES(${args.authorid},${args.postid},'${args.content}','${date}',${args.replyToCommentId ? `'${args.replyToCommentId}'` : 'NULL'})`);
			if (!res.changes) {
				return {
					code:400,
					success:false,
				}
			}
			return {
				code:200,
				success:true,
				commentId:res.lastID,
				addedComment: {
					id:res.lastID,
					author:getUserById(args.authorid),
					postId:args.postid,
					replies: null,
					content:args.content,
					date:date,
					replyto: args.replyToCommentId ? args.replyToCommentId : null
				}
			}
		},
		updateComment: async(w,args) => {
			///*
			let commAuthor = await db.get(`SELECT authorid FROM comments WHERE id = ${args.id}`);
			if (args.updaterId != commAuthor.authorid) {
				return {
					code:403,
					success:false,
					commentId:args.id
				}
			}
			//*/
			let res = await db.run(`UPDATE comments SET content = '${args.content}' WHERE id = ${args.id}`);
			let _updatedComment = await db.get(`SELECT * FROM comments WHERE id = ${args.id}`);
			_updatedComment.author = getUserById(_updatedComment.authorid);
			return {
				code:200,
				success:true,
				commentId:args.id,
				updatedComment:_updatedComment
			}
		},
		deleteComment: async(w,args) =>{
			let comm = await db.get(`SELECT authorid, postid FROM comments WHERE id = ${args.id}`);
			let post = await db.get(`SELECT authorid FROM posts WHERE id = ?`,[comm.postid]);
			if (args.deleterId != comm.authorid && args.deleterId != post.authorid) { // LЭ
				return {
					code:403,
					success:false,
					commentId:args.id
				}
			}
			let _deletedCom = db.get(`SELECT * FROM comments WHERE id = ${args.id}`);
			let res = await db.run(`DELETE FROM comments WHERE id = ${args.id}`);
			_deletedCom.author = getUserById(_deletedCom.authorid);
			_deletedCom.replies = getCommentReplies(_deletedCom.id)
			if (!res.changes) {
				return {
					code:400,
					success:false,
					commentId:args.id
				}
			}
			return {
				code:200,
				success:true,
				commentId:args.id,
				deletedComment: _deletedCom
			}
		}
	}
};
const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});//h