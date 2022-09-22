const MY_OID = "c0d50254-fbf3-ed24-06c3-3aecbe2f7c10"

const attr_list = [
	"address1",
	"address2",
	"address3",
        "address4",
        "postal-code",
	"dob",
        "last-name-kana",
        "first-name-kana",
        "last-name",
       	"first-name",
        "gender"
];
const element_list = ["register",
	         "logged-in",
	         "id-select",
	         "in-progress",
	         "in-progress-sms",
	         "in-progress-otp",
	         "updated",
	         "logged-out",
	         "form",
	         "form-phone",
	         "otp-form",
	         "attributes",
	         "submit-button",
			 "complete-reservation",
			 "reserve",
];
const j = jQuery.noConflict();

//window.onload = function() {
//	console.log("load：リソースファイルを全て読み込みました。");
//	logoutUser();
//	displayLoginPage();
    //loadUser();	
//}

//ページ読み込み時にログアウト
jQuery(function(){
	logoutUser();
  });

j('input[name="id-type"]').change(function() {
    	if (this.value === "email_address") {
		j('#form').show();
		j('#form-phone').hide();
		j("#otp-form").hide();
                j("#phone-options").find("option[value='sms_link']").prop("selected", true);
                j('#submit-button').show();
	}
	else if (this.value === "phone_number"){
                j('#form-phone').show();
                j('#form').hide();
                j("#phone-options").find("option[value='sms_link']").prop("selected", true);
                j('#submit-button').show();
	}
	else{
		return;
	}
});

j("#phone-options").change(function(){
	const selected_value = this.value;
	if(selected_value === "otp_via_sms"){
		j("#otp-form").show()
		j("#submit-button").hide()
	}
	else{
		j("#otp-form").hide();
		j("#submit-button").show()
	}
});

function getOTP() {
	return new Promise((resolve) => {
		j("#otp_button").click(function(){
        		resolve(j("#otp_value").val())
		});
	});
}

function showIDform(){
	var id_type = j('input[name="id-type"]:checked').val();
	if ( id_type === "email_address"){
        	j('#form').show();
                j('#form-phone').hide();
                j('#otp-form').hide();
                j('#submit-button').show();

	}
	else if ( id_type === "phone_number"){
                j('#form').hide();
                j('#form-phone').show();
                j('#submit-button').show();
	}
	else{
		return;
	}
	return;
}

function displayElement(show_list){
	element_list.forEach(element => {
		var this_element = show_list.find(show_element => show_element === element);
		if(this_element === undefined){
			var hide_string = '#' + element;
			j(hide_string).hide();
		}
		else{
			var show_string = '#' + element;
			j(show_string).show();
		}
	});
	return;
}

function displayLoginPage(){
	showIDform();
	var show_list = ["id-select",
		         "register",
		         "form",
		         "submit-button",
		        ];
	displayElement(show_list);
	return;
}

function displayAttributePage(){
	var show_list = ["logged-in",
		         "attributes",
				 "complete-reservation",
		        ];
	displayElement(show_list);
	return;
}

function logoutUser() {
	const slp = new SlashPayment(MY_OID);
	slp.logout();
        j('#form').trigger('reset');
        j('#form-phone').trigger('reset');
        j('#attributes').trigger('reset');
	j("#logged-out").show();
	j("#reserve").hide();
	showIDform();
	displayLoginPage();
	return;
}

async function registerUser() {

	const slp = new SlashPayment(MY_OID);
	const id_type = j('input[name="id-type"]:checked').val();
	var username = undefined;
	var authmethod = undefined;
	if ( id_type === "email_address"){
		username = j("#email").val();
        	authmethod = j("#email-options option:selected").text();
                j('#in-progress').show();
	}
	else if ( id_type === "phone_number"){
		username = j("#phone").val();
        	authmethod = j("#phone-options option:selected").text();
		if (authmethod === "otp_via_sms"){
			j('#in-progress-otp').show();
		}
		else{
                        j('#in-progress-sms').show();
		}
	}
	else{
		return;
	}
        j('#submit-button').hide();
        j('#id-select').hide();
        j('#logged-out').hide();
        j('#updated').hide();
        j('#form').hide();
	j('#form-phone').hide();

        try{
		if (authmethod === "otp_via_sms"){
			await slp.smsOtp(username);
			await postProcess(slp);
			j("#otp-form").hide();
		}
		else if (authmethod === "sms_link"){
			await slp.smsLink(username);
			await postProcess(slp);
		}
		else if (authmethod === "email_link"){
			await slp.emailLink(username);
			await postProcess(slp);
		}
		else if (authmethod === "webauthn"){
			await slp.webAuthnLocal(username, id_type);
			await postProcess(slp);
		}
		else if (authmethod === "webauthn_via_sms"){
			await slp.webAuthnLocal(username, id_type);
			await postProcess(slp);
		}
		else if (authmethod === "webauthn_via_email"){
			await slp.webAuthnRemote(username, id_type);
			await postProcess(slp);
		}
		else{
			return;
		}
        }
        catch(e) {
                console.error( e.name, e.message );
        }
}

async function postProcess(slp){
        try{
		if (slp.user.token.length > 0){
			displayAttributePage();
        	        if (slp.user.firstLogin) {
				const user_attr = dictAttr(attr_list);
				await slp.setAttribute(user_attr);
			}
                        else{
                	        loadUser();
                        }
        	}
		else{
	                displayLoginPage();
		}
	}
        catch(e) {
                console.error( e.name, e.message );
        }
}

async function loadUser() {

	const slp = new SlashPayment(MY_OID);
        try{
		slp.getUserFromToken();
                if (slp.user === undefined) {
                        displayLoginPage();
                } 
		else {
			displayAttributePage();
			const attrs = await slp.getAttribute(attr_list);
                        mapAttr(attrs);
                }
	}
        catch(e) {
                console.error( e.name, e.message );
        }
}

function mapAttr(attrs){
        for (const [key, value] of Object.entries(attrs)) {
                if (key === "gender"){
                	if (value.length > 0){
                        	var attr_str = "#"+value.toLowerCase();
                                j(attr_str).prop("checked", true);
                        }
                }
                else{
                        var attr_str = "#"+key;
                        j(attr_str).val( value );
                }
        }
}

function dictAttr(attrs){
	var attr_dict = {};
	attr_list.forEach(attr => {
		var this_attr = attr_list.find(attr_fixed => attr_fixed === attr);
		if(this_attr === undefined){
			return;
		}
		else{
			var attr_string = '';
			if(attr === "gender"){
				attr_string = 'input[name=' + attr + ']:checked';
			}
			else{
				attr_string = '#' + attr ;
			}
			attr_dict[attr] = j(attr_string).val();
		}
	});
	return attr_dict;
}

async function editUser() {        
         
	const slp = new SlashPayment(MY_OID);
	try{
		slp.getUserFromToken();
                if (slp.user === undefined) {
			displayLoginPage();
		}
		else {
			const user_attr = dictAttr(attr_list);
			await slp.setAttribute(user_attr);
                        j('#updated').show();
                        j('#logged-in').show();
                }
		return;
	}
        catch(e) {
		console.error( e.name, e.message );
	}
}