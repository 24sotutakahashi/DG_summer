/**
 * Wrapper class for slashID javascript library
 * 
 */
 class SlashPayment {
	/**
	 * Constructor
	 * @constructor
	 * @param {String} OID - Organization ID
	 * @returns {SlashPayment} SlashPayment object
	 * @example
	 * const slp = new SlashPayment('XXXX'); 
	 */
	constructor(OID) {
		this.OID = OID;
		this.sid = new slashid.SlashID();
		this.user = undefined;
		this.authmethod = undefined;
		this.username = undefined;
		this.id_type = undefined;
	}

	/**
	 * Logging out a user by clearing a token
	 * @method
	 * @example
	 * slp.logout();
	 */
	logout() {
		window.localStorage.removeItem("USER_TOKEN");
	}
	
	/**
	 * Recreating a user with a token
	 * @method
	 * @example
	 * slp.getUserFromToken();
	 */
	getUserFromToken() {
                const prevToken = window.localStorage.getItem("USER_TOKEN")
		if (prevToken) {
			this.user = new slashid.User(prevToken);
		}
		else{
			return;
		}
        }

	/**
	 * Retrieving user attributes
	 * @async
	 * @method
	 * @param {Array.<string>} user_attr - List of user attributes
	 * @returns {Object.<string, string>} Dictionary of user attributes
	 * @example
	 * const userAttribute = await slp.getAttribute(['attr_1', 'attr_2']);
	 */
	async getAttribute(user_attr) {
		if(this.user === undefined){
			return {};
		}
		else{
                        const this_attr = await this.user.get(user_attr);
                        return this_attr;
                }
        }

	/**
	 * Setting user attributes
	 * @async
	 * @method
	 * @param {Object.<string, string>} user_attr - Dictionary of user attributes
	 * @example
	 * await slp.SetAttribute({'attr_1':'value_1', 'attr_2':'value_2'});
	 */
	async setAttribute(user_attr) {
		if(this.user === undefined){
			return;
		}
		else{
                        await this.user.set(user_attr);
                }
		return;
        }

	/**
	 * Authenticating with WebAuthn remotely
	 * @async
	 * @method
	 * @param {String} username - User ID
	 * @param {Srting} id_type - Identifier type
	 * @example
	 * await slp.webAuthnRemote('example@test.com', 'email_address');
	 */
	async webAuthnRemote(username, id_type) {
		this.id_type = id_type;
		this.username = username;
		if( this.id_type === "email_address"){
			this.authmethod = "webauthn_via_email";
		}
		else if( this.id_type === "phone_number"){
			this.authmethod = "webauthn_via_sms";
		}
		else{
			return ;
		}
                this.user = await this.sid.id(
			this.OID,
	                {
        	        	type: this.id_type,
		                value: this.username
        	        },
                	{
        	        	method: this.authmethod
		        }
        	);
		window.localStorage.setItem("USER_TOKEN", this.user.token)
	}

	/**
	 * Authenticating with WebAuthn locally
	 * @async
	 * @method
	 * @param {String} username - User ID
	 * @param {Srting} id_type - Identifier type
	 * @example
	 * await webAuthnLocal('+8109000000000', 'phone_number');
	 */
	async webAuthnLocal(username, id_type) {
		this.id_type = id_type;
		this.username = username;
		this.authmethod = "webauthn";
                this.user = await this.sid.id(
			this.OID,
	                {
        	        	type: this.id_type,
		                value: this.username
        	        },
                	{
        	        	method: this.authmethod
		        }
        	);
		window.localStorage.setItem("USER_TOKEN", this.user.token)
	}

	/**
	 * Authenticating with an email link
	 * @async
	 * @method
	 * @param {String} username - User ID
	 * @example
	 * await emailLink('example@test.com');
	 */
	async emailLink(username) {
		this.id_type = "email_address";
		this.username = username;
		this.authmethod = "email_link";
                this.user = await this.sid.id(
			this.OID,
	                {
        	        	type: this.id_type,
		                value: this.username
        	        },
                	{
        	        	method: this.authmethod
		        }
        	);
		window.localStorage.setItem("USER_TOKEN", this.user.token)
	}

	/**
	 * Authenticating with a SMS link
	 * @async
	 * @method
	 * @param {String} username - User ID
	 * @example
	 * await smsLink('+8109000000000');
	 */
	async smsLink(username) {
        	this.id_type = "phone_number";
		this.username = username;
		this.authmethod = "sms_link";
                this.user = await this.sid.id(
			this.OID,
	                {
        	        	type: this.id_type,
		                value: this.username
        	        },
                	{
        	        	method: this.authmethod
		        }
        	);
		window.localStorage.setItem("USER_TOKEN", this.user.token)
	}

	/**
	 * Authenticating with OTP via SMS
	 * @async
	 * @method
	 * @param {String} username - User ID
	 * @example
	 * await smsOtp('+8109000000000');
	 */
	async smsOtp(username) {
        	this.id_type = "phone_number";
		this.username = username;
		this.authmethod = "otp_via_sms";
                this.user = await this.sid.id(
			this.OID,
	                {
        	        	type: this.id_type,
		                value: this.username
        	        },
                	{
        	        	method: this.authmethod,
				options: {
					getOTP: getOTP
				}
		        }
        	);
		window.localStorage.setItem("USER_TOKEN", this.user.token)
	}

	/**
	 * Getting a payment token
	 * @async
	 * @method
	 * @param {String} merchantID - Merchant ID
	 * @param {String} userID - User ID
	 * @param {Object.<string, string>} cardDetails - Credit card details
	 * @returns {String} Payment token if succeeded
	 * @example
	 * Not implemented yet
	 */
	async getPaymentToken(merchantID, userID, cardDetails){
		// get DGFT payment token
		const paymentToken = 'Place_Holder';
		return paymentToken;
	}

	/**
	 * Sending payment details
	 * @async
	 * @method
	 * @param {String} merchantID - Merchant ID
	 * @param {String} paymentToken - Payment token
	 * @param {String} userID - User ID
	 * @param {Object.<string, string>} paymentDetails - Payment details
	 * @param {Object.<string, string>} options - Options
	 * @returns {Object.<string, string>} Transaction result
	 * @example
	 * Not implemented yet
	 */
	async sendPayment(merchantID, paymentToken, userID, paymenDetails, options){
		// send payment details with obtained token and options
		const transactionResult = "Place_Holder";
		return transactionResult;
	}
}