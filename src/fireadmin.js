import _ from 'lodash';
import config from './config';
import logger from './utils/logger';
import Firebase from 'firebase';

class Fireadmin {
	/* Constructor
	 * @param {string} appName Name of application
	 */
	constructor(url, opts) {
		if (!url) {
			logger.error({description: 'Application name requires to use Fireadmin.', func: 'constructor', obj: 'Fireadmin'});
			throw new Error('Application name is required to use Fireadmin');
		} else {
			this.ref = new Firebase(url);
			this.fbUrl = url;
			this.appName = AppNameFromUrl(url);
		}
		if (opts) {
			this.options = opts;
		}
	}
	get auth() {
		return this.ref.getAuth();
	}
	get isAuthorized() {
		return !this.auth || this.auth === null;
	}
	/**
  * This callback is displayed as part of the Requester class.
  * @callback Fireadmin~errorCb
  * @param {String} code
  * @param {String} message
  */
  /**
   * Creates an object provided the name of the list the object will go into and the object itthis.
   * The object is created with a createdAt parameter that is a server timestamp from Firebase.
   * If a user is currently signed in, the object will contain the author's `$uid` under the author parameter.
   * @param {String} listName - The name of the list the object will be put into. `Required`
   * @param {Object} objectData - Data you wish to be contained within new object. `Required`
   * @param {Function} onSuccess - Function that runs when your object has been created successfully and returns newly created object. `Optional`
   * @param {Function} onError - Function that runs if there is an error creating the object. `Optional`
   * @example
   * //creates new message object in message list
   * fa.createObject('messages', {title:Example, content:'Cool Message'}, ).then(function(newMsg){
   *  logger.log('New Message created successfuly:', newMsg);
   * }, function(err){
   *  logger.error('Error creating new message:', err);
   * });
   */
	createObject(listName, obj) {
    var auth = this.ref.getAuth();
    if (auth) {
      obj.author = auth.uid;
    }
    obj.createdAt = Date.now();
    return this.ref.child(listName).push(obj, (err) => {
      if (!err) {
				return Promise.resolve(obj);
      } else {
				return Promise.reject(err);
      }
    });
  }
	/**
	 * Gets list of objects created by the currently logged in User.
	 * @param {String | Array} listPath -  The name or path of the list the objects will be grabbed from. `Required`
	 * @param {String} Uid - The Uid of the user that created objects. `Required`
	 * @param {Function} onSuccess - Function that runs when the list has been retrieved successfully. `Optional`
	 * @param {Fireadmin~errorCb} onError -  Function that runs if there is an error. `Optional`
	 * @example
	 * // Signin User with email and password
	 * var uid = 'simplelogin:1';
	 * fb.listByUid('messages', uid, function(messageList){
	 *  logger.log('List of messages by ' + uid + ' : ', messageList);
	 * }, function(err){
	 *  logger.error('Error getting message list:', err);
	 * });
	 */
	listByCurrentUser(listName) {
		if (!listName) {
			return Promise.reject({message: 'Listname required to list objects.'});
		}
    if (this.isAuthorized) {
      let authorObjQuery = this.ref.child(listName).orderByChild('author').equalTo(auth.uid);
			return authorObjQuery.on('value', (listSnap) => {
				return Promise.resolve(listSnap.val());
      }, (err) => {
				return Promise.reject(err);
      });
    } else {
      var error = {code: 'INVALID_AUTH', message: 'listByCurrentUser cannot load list without current user'};
      logger.error(error.message);
			return Promise.reject(error);
    }
	}
	/**
	 * Gets list of objects created by the currently logged in User.
	 * @param {String | Array} listPath -  The name or path of the list the objects will be grabbed from. `Required`
	 * @param {String} Uid - The Uid of the user that created objects. `Required`
	 * @param {Function} onSuccess - Function that runs when the list has been retrieved successfully. `Optional`
	 * @param {Fireadmin~errorCb} onError -  Function that runs if there is an error. `Optional`
	 * @example
	 * // Signin User with email and password
	 * var uid = 'simplelogin:1';
	 * fb.listByUid('messages', uid, function(messageList){
	 *  logger.log('List of messages by ' + uid + ' : ', messageList);
	 * }, function(err){
	 *  logger.error('Error getting message list:', err);
	 * });
	 */
	listByUid(uid) {
		return this.fbRef(listPath).orderByChild('author').equalTo(uid).on('value', (listSnap) => {
			return Promise.resolve(listSnap.val());
    }, (err) => {
			return Promise.reject(err);
    });
	}
	/**
   * Get total user count
   * @param {Function} onSuccess - Function that returns total user count. `Optional`
   * @param {Fireadmin~errorCb} onError - Function that runs if there is an error. `Optional`
   * @example
   * fa.getUserCount('users', function(count){
   *  logger.log('There are is a total of ' + count + ' users.');
   * });
   */
  getUserCount() {
    return this.ref.child('users').on('value', (usersListSnap) => {
			return Promise.resolve(usersListSnap.numChildren());
    }, (err) => {
			logger.error({description: 'Error getting user count.', func: 'getUserCount', obj: 'Fireadmin'});
			return Promise.reject(err);
    });
  }
  /** Get the number of users that are currently online.
   * @memberOf Fireadmin#
   * @param {Function} onSuccess - Function that returns number of users currently online. `Optional`
   * @param {Fireadmin~errorCb} onError - Function that runs if there is an error. `Optional`
   * @example
   * fa.getOnlineUserCount(function(count){
   *   logger.log('There are ' + count + ' users currently online.');
   * });
   *
   */
  getOnlineUserCount() {
    return this.ref.child('presence').on('value', (onlineUserSnap) => {
      logger.log('There are currently' + onlineUserSnap.numChildren() + ' users online.');
			return Promise.resolve(onlineUserSnap.numChildren());
    }, (err) => {
			return Promise.reject(err);
    });
  }
  /**
   * Get the number of sessions between two times
   * @param {Number} startTime - The time at which to start the between period (in UTC ms). `Required`
   * @param {Number} endTime - The time at which to start the between period (in UTC ms). `Required`
   * @param {Function} onSuccess - Function that runs on completion of gathering list count. `Optional`
   * @param {Fireadmin~errorCb} onError - Function that runs if there is an error. `Optional`
   * @example
   * //String list name
   * fa.getObjectCount('users', function(count){
   *  logger.log('There are ' + count + ' users');
   * });
   */
  sessionsBetween(time1, time2) {
    logger.log({description: 'Sessions between called.', startTime: time1, endTime: time2, func: 'sessionsBetween', obj: 'Fireadmin'});
    return this.ref.child('sessions').orderByChild('ended').startAt(time1).endAt(time2).on('value', (sessionsSnap) => {
			return Promise.resolve(sessionsSnap.numChildren());
    }, (err) => {
			logger.error({description: 'Error getting sessions between specified times.', error: err, func: 'sessionsBetween', obj: 'Fireadmin'});
			return Promise.reject({message: 'Error getting sessions.'});
    });
  }
  /**
   * Get the number of sessions since a specific time
   * @param {String} time - The UTC time to calculate from.
   * @param {Function} onSuccess - Function that runs on completion of gathering list count. `Optional`
   * @param {Fireadmin~errorCb} onError - Function that runs if there is an error. `Optional`
   * @example
   * var dt = new Date(); //Create a new Data object
   * dt.setMonth(dt.getMonth()-1); //Set date back a month
   * var monthAgo = dt.getTime(); //Convert to UTC time
   * //Get number of sessions since a month ago
   * fa.sessionsSince(monthAgo, function(count){
   *  logger.log('There are ' + count + ' sessions in the past month');
   * });
   */
  sessionsSince(time) {
    return this.ref.child('sessions').orderByChild('ended').startAt(time).endAt(Date.now()).on('value', (sessionsSnap) => {
			return Promise.resolve(sessionsSnap.numChildren());
    }, (err) => {
			logger.error({description: 'Error getting sessions between specified times.', error: err, func: 'sessionsSince', obj: 'Fireadmin'});
			return Promise.reject(err);
    });
  }
  /**
   * Get count of objects in a given path or list
   * @param {Function} onSuccess - Function that runs on completion of gathering average session length. `Optional`
   * @param {Fireadmin~errorCb} onError - Function that runs if there is an error. `Optional`
   * @example
   * //Get the average session length
   * fa.averageSessionLength(function(count){
   *  logger.log('The average session length is ~' + count ' mins');
   * });
   */
  averageSessionLength() {
    return this.ref.child('sessions').on('value', (sessionsSnap) => {
      var totalLength = null;
      var sessionCount = sessionsSnap.numChildren();
      sessionsSnap.forEach((sessionSnap) => {
        var session = sessionSnap.val();
        if (session.hasOwnProperty('ended') && session.hasOwnProperty('began')) {
          //Gather length of session
          // Convert difference in ms to minutes
					var conversion = (session.ended - session.began) / (1000 * 60) ;
          totalLength = totalLength + conversion;
          logger.log('total length is now:', totalLength);
        } else {
          logger.log('removing unfinished session:', sessionSnap.val());
          sessionCount--;
          logger.log('session count:', sessionCount);
        }
      });
      logger.log('totalLength:', totalLength);
      var average = Math.floor(totalLength / sessionCount);
      logger.log('average in minutes:', average);
			return Promise.resolve(average);
    }, (err) => {
			return Promise.reject(err);
    });
  }
  removeUserSessions(uid) {
    return this.ref.child('sessions').orderByChild('user').equalTo(uid).on('value', (sessionsSnap) => {
     var sessionCount = sessionsSnap.numChildren();
      sessionsSnap.forEach((session) => {
        session.ref().remove();
      });
      logger.log(sessionCount + ' Sessions sucessfully removed');
			return Promise.resolve();
    }, (err) => {
			return Promise.reject(err);
    });
  }
  customAuthToken(img) {
    //Send file to server
    var fa = this;
    var reqData = {appName: fa.appName};
    apiRequest('auth', reqData, (res) => {
      if (res.hasOwnProperty('token')) {
        logger.log('auth request response:', res);
				return Promise.resolve(res);
      } else {
				return Promise.reject({code: 'SERVER_ERROR'});
      }
    }, (err) => {
			return Promise.reject(err);
    });
  }
  /** Modified version of Firebase's authWithPassword that handles presence
   * @memberOf Fireadmin#
   * @param {Object | String} loginData - Login data object or string for 3rd Party Signup (Twitter, Github, Google) `Required`
   * @param {Object} loginData.email - Email of new user (`Required` only for email signup).
   * @param {Function} onSuccess Function that runs when the user is successfully authenticated with presence enabled. `Optional`
   * @param {Fireadmin~errorCb} onError Function that runs if there is an error. `Optional`
   * @example
   * // Signin User with email and password
   * fb.userSignup({email:test@test.com, password:'testtest'}, function(auth){
   *  logger.log('Login Successful for user:', auth.uid);
   * }, function(err){
   *  logger.error('Error logging in:', err);
   * });
   */
  userSignup(signupData) {
    if (typeof signupData === 'object' && signupData.hasOwnProperty('email')) {
      //Email signup
      if (!signupData.hasOwnProperty('password') && signupData.password.length <= 8) {
        return handleCb(errorCb,{message: 'A valid Password is required to signup.'});
      }
      //Create new user in simple login
      return this.createUser(signupData, (error) => {
        if (error === null) {
          logger.log('[emailSignup] User created successfully. Logging in as new user...');
            // Login with new account
            this.emailAuth(signupData, (authData) => {
              //Create new user profile
              return createUserProfile(authData, this.ref, (userAccount) => {
								return Promise.resolve(userAccount);
              }, (err) => {
                //Error creating profile
								return Promise.reject(err);
              });
            }, (err) => {
              //Error authing with email
							return Promise.reject(err);
            });
        } else {
          //Error creating new User
          logger.error('[emailSignup] Error creating user:', error.message);
					return Promise.reject(error);
        }
      });

    } else if (signupData.hasOwnProperty('type') && signupData.type == 'username') {
      //[TODO] User signup with with custom auth token with username as uid
      //Username signup
      //request a signup with username as uid
      apiRequest('signup', signupData, (res) => {
        logger.log('request for token successful:', res);
        return this.authWithCustomToken(res.token, (err, authData) => {
          if (err) {
						return Promise.reject(err);
					}
          return createUserProfile(authData, this.ref, (userAccount) => {
						return Promise.resolve(userAccount);
          }, (err) => {
            //Error creating profile
						return Promise.reject(err);
          });
        });
      }, (err) => {
				return Promise.reject(err);
      });
    } else if (typeof signupData == 'string' || signupData.hasOwnProperty('type')) {
      //3rd Party Signup
			let provider = typeof signupData === 'string' ? signupData : signupData.type;
      // Auth using 3rd party OAuth
      return this.authWithOAuthPopup(provider, (err, authData) => {
				if (err) {
					return Promise.reject(err);
				}
        //Create new profile with user data
        return createUserProfile(authData, this.ref, (userAccount) => {
					return Promise.resolve(userAccount);
        }, (err) => {
          //Error creating profile
					return Promise.reject(err);
        });
      });
    }
  }

  /** Modified version of Firebase's authWithPassword that handles presence
   * @memberOf Fireadmin#
   * @param {Object} loginData Login data of new user
   * @param {Function} onSuccess Function that runs when the user is successfully authenticated with presence enabled. `Optional`
   * @param {Fireadmin~errorCb} onError Function that runs if there is an error. `Optional`
   * @example
   * // Signin User with email and password
   * fb.emailAuth({email:test@test.com, password:'testtest'}, function(auth){
   *  logger.log('Login Successful for user:', auth.uid);
   * }, function(err){
   *  logger.error('Error logging in:', err);
   * });
   */
  emailAuth(loginData) {
    return this.ref.authWithPassword(loginData, (error, authData) => {
      if (error === null) {
        // user authenticated with Firebase
        logger.log('User ID: ' + authData.uid + ', Provider: ' + authData.provider);
        // Manage presence
        this.setupPresence(authData.uid);
        // [TODO] Check for account/Add account if it doesn't already exist
				return Promise.resolve(authData);
      } else {
        logger.error('Error authenticating user:', error);
				return Promise.reject(err);
      }
    });
  }
  /** Modified version of Firebase's authWithOAuthPopup function that handles presence
   * @memberOf Fireadmin#
   * @param {String} provider - Login data of new user. `Required`
   * @param {Function} onSuccess - Function that runs when the user is successfully authenticated with presence enabled. `Optional`
   * @param {Fireadmin~errorCb} onError - Function that runs if there is an error. `Optional`
   * @example
   * // Signin User with email and password
   * fb.authWithOAuthPopup('google', function(auth){
   *  logger.log('Login Successful for user:', auth.uid);
   * }, function(err){
   *  logger.error('Error logging in:', err);
   * });
   */
  authWithOAuthPopup(provider) {
    //[TODO] Check enabled login types
    return this.ref.authWithOAuthPopup(provider,(error, authData) => {
      if (error === null) {
        // user authenticated with Firebase
        logger.log({description: 'Auth popup responded.', authData: authData, id: authData.uid, provider: authData.provider, func: 'authWithOAuthPopup', obj: 'Fireadmin'});
        // Manage presence
        this.setupPresence(authData.uid);
        // [TODO] Check for account/Add account if it doesn't already exist
				return Promise.resolve(authData);
      } else {
        logger.error('Error authenticating user:', error);
				return Promise.reject(error);
      }
    });
  }
  newUserFromAnonyomous() {

  }
  /** Log in with Github through OAuth
   * @memberOf Fireadmin#
   * @param {Function} onSuccess - Function that runs when the user is successfully authenticated with presence enabled. `Optional`
   * @param {Fireadmin~errorCb} onError - Function that runs if there is an error. `Optional`
   * @example
   * // Signin User with email and password
   * fb.githubAuth(function(auth){
   *  logger.log('Login Successful for user:', auth.uid);
   * }, function(err){
   *  logger.error('Error logging in:', err);
   * });
   */
  githubAuth() {
    return this.authWithOAuthPopup('github');
  }
  /** Modified version of Firebase's authWithPassword that handles presence
   * @memberOf Fireadmin#
   * @param {Function} onSuccess Function that runs when the user is successfully authenticated with presence enabled. `Optional`
   * @param {Fireadmin~errorCb} onError Function that runs if there is an error. `Optional`
   * @example
   * // Signin User with email and password
   * fb.githubAuth(function(auth){
   *  logger.log('Login Successful for user:', auth.uid);
   * }, function(err){
   *  logger.error('Error logging in:', err);
   * });
   */
  googleAuth() {
    return this.authWithOAuthPopup('google');
  }
  /** Modified version of Firebase's authWithPassword that handles presence
   * @memberOf Fireadmin#
   * @param {Function} onSuccess Function that runs when the user is successfully authenticated with presence enabled. `Optional`
   * @param {Fireadmin~errorCb} onError Function that runs if there is an error. `Optional`
   * @example
   * // Signin User with email and password
   * fb.githubAuth(function(auth){
   *  logger.log('Login Successful for user:', auth.uid);
   * }, function(err){
   *  logger.error('Error logging in:', err);
   * });
   */
  twitterAuth() {
    return this.authWithOAuthPopup('twitter');
  }

  /** Get account for a user given their uid.
   * @memberOf Fireadmin#
   * @param {String} uid Unique Id for account.
   * @param {Function} onSuccess Function that returns account info once it is loaded. `Optional`
   * @param {Fireadmin~errorCb} onError Function that runs if there is an error. `Optional`
   * @example
   * // Get account for uid: simplelogin:1
   * fa.accountByUid('simplelogin:1', function(account){
   *   logger.log('Account for user with uid: ' + uid + ' is : ', account);
   * }, function(err){
   *    logger.error('Error getting account for ' + uid + ' : ', err);
   * });
   *
   */
  accountByUid(uid) {
    return this.ref.child(uid).on('value', (accountSnap) => {
      handleCb(successCb, accountSnap.val());
    }, (err) => {
      logger.error('Error getting account for ' + uid + ' : ', err);
			return Promise.reject(err);
    });
  }
  /** Get user account that is associated to a given email.
   * @memberOf Fireadmin#
   * @param {String} email - Email of account to retreive.
   * @param {Fireadmin~accountByEmailCb} onSuccess - Function that returns account info once it is loaded. `Optional`
   * @param {Fireadmin~errorCb} onError - Function that runs if there is an error. `Optional`
   * @example
   * fa.accountByEmail('test@test.com', function(account){
   *   logger.log('Account loaded:' + account);
   * }, function(err){
   *  logger.error('Error getting account by email:', err);
   * });
   *
   */
  accountByEmail(email) {
    if (email && typeof email == 'string') {
      return this.ref.child('users').orderByChild('email').equalTo(email).on('value', (querySnapshot) => {
        logger.log('accountByEmail returned:', querySnapshot.val());
				return Promise.resolve(querySnapshot.val());
      }, (err) => {
        logger.error('Error getting account by email:', err);
				return Promise.reject(err);
      });
    } else {
			return Promise.reject({message: 'Email is required to get account.'});
    }
  }
  /**
   * Success callback for accountByEmail function that returns the account associated with a provided email.
   * @callback Fireadmin~accountByEmailCb
   * @param {Object} account Account associated with provided email.
   * @param {String} account.email Email associated with account.
   * @param {String} account.createdAt UTC Time when the account was created.
   */

  /** Start presence management for a specificed user uid. This function is used within Fireadmin login functions.
   * @memberOf Fireadmin#
   * @param {String} uid Unique Id for user that for which presence is being setup.
   * @example
   * fa.setupPresence('simplelogin:1');
   *
   */
  setupPresence(uid) {
    logger.log({description: 'setupPresence called', uid: uid, func: 'setupPresense', obj: 'Fireadmin'});
    var amOnline = this.ref.child('.info/connected');
    var onlineRef = this.ref.child('presence').child(uid);
    var sessionsRef = this.ref.child('sessions');
    var userRef = this.ref.child('users').child(uid);
    var userSessionRef = this.ref.child('users').child(uid).child('sessions');
    var pastSessionsRef = userSessionRef.child('past');
    return amOnline.on('value', (snapShot) => {
      if (snapShot.val()) {
        //user is online
        var onDisconnectRef = this.ref.onDisconnect();
        // add session and set disconnect
        var session = sessionsRef.push({began: Firebase.ServerValue.TIMESTAMP, user: uid});
        var endedRef = session.child('ended');
        endedRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
        //add correct session id to user
        // adding session id to current list under user's session
        var currentSesh = userSessionRef.child('current').push(session.key());
        // Remove session id from users current session folder
        currentSesh.onDisconnect().remove();
        // remove from presence list
        onlineRef.set(true);
        onlineRef.onDisconnect().remove();
        // Add session id to past sessions on disconnect
        // pastSessionsRef.onDisconnect().push(session.key());
        // Do same on unAuth
        this.onAuth((authData) => {
          if (!authData) {
            endedRef.set(Firebase.ServerValue.TIMESTAMP);
            currentSesh.remove();
            onlineRef.remove();
          }
        });
      }
    });
  }
  /** Get a firebase reference for a path in array | string form
   *
   * @memberOf Fireadmin#
   * @param {String|Array} path relative path to the root folder in Firebase instance
   * @returns A Firebase instance
   * @example
   * //Array as path
   * var userRef = fa.fbRef(['users', uid]);
   */
  fbRef(path) {
    var ref = this.ref;
    var args = Array.prototype.slice.call(arguments);
    if (args.length) {
      //[TODO] Have this return a Fireadmin object
      ref = ref.child(pathRef(args));
    }
    return ref;
  }
};
export default Fireadmin;