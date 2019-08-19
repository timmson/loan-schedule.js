var response_script = 'ajax.php';
var post_vars;
var xmlHttp;
var oper;

function help(mail)
{
    alert('??? ?? ???????? ?????? ?????. ??? ?? ????????? ?????????? ???????? ? ?????? ?????????: ' + mail);
    return;
}

function reqobject() {
	this.name = 0;
	this.value = 0;
}

function filter4pair(key, value) {
	var obj = new reqobject();
	obj.name = key;
	obj.value = value;
	filter(obj);
	return;
}
function filter(obj) {
	var url = window.location.toString().split('?')[1];
	var exist = false;
	var vars = [];
	if (url != null) {
		vars = url.split('&');
		for (i=0; i<vars.length; i++) {
			if (vars[i].split('=')[0]==obj.name) {
			   exist = true;
			   vars[i] = obj.name+'='+obj.value;
			}
		}
	}
	if (!exist) vars[vars.length] =  obj.name+'='+obj.value;
	//alert('?'+vars.join('&'));
	window.location='?'+vars.join('&');
	return;
}	

function debugInfo(obj) {
	if (obj.style.display=='block') {
		obj.style.display = 'none';
	} else {
		obj.style.display = 'block';
	}
	return;
}
//end of new


