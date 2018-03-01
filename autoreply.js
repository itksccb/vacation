function main() {
	let ARBody = '';
	let err = {msg: '', title:''};
	try {
		ARBody = UrlFetchApp.fetch('https://it.ksccb.com/vacation/vacation.json');
	}catch(e) {
		err.msg = e.message
			+ "\nFile: " + e.fileName
			+ "\nLine: " + e.lineNumber;
		err.title = 'Autoreply ksccb.com Error';

		try {
			ARBody = UrlFetchApp.fetch('https://itksccb.github.io/vacation/vacation.json');
		}catch(e) {
			err.msg = e.message
			+ "\nFile: " + e.fileName
			+ "\nLine: " + e.lineNumber;

			err.title = 'Autoreply github & ksccb Error';			
		}
	}


	if (ARBody.length === 1){
		MailApp.sendEmail("risiyanto@ksccb.com, yuda@ksccb.com", err.title, err.msg);
	}else {
		let vacancy = JSON.parse(ARBody);

		const now 	= new Date(); 
		const start	= new Date(vacancy.start);
		const end	= new Date(vacancy.end);
  		let re 		= vacancy.re.split("<br>").join("\n");
		re 			= re.replace("{{start}}", formatDate(start));
		re 			= re.replace("{{end}}", formatDate(end));

		if ( start <= now && now < end ) {
			autoReply(vacancy,re);    
		}
	}
}

  
function autoReply(vacancy,re) {
	const after	= vacancy.start.split("-").join("/");
	const before	= vacancy.end.split("-").join("/");

	const filter="in:trash is:read -from:ksccb.com,-no_reply,-noreply,-no-reply,-notification after:"+after+" before:"+before;
	  
	const threads = GmailApp.search(filter);

	const label = GmailApp.getUserLabelByName("Auto Replied");

	// if label not exist yet create one.
	if (label === null) {
		GmailApp.createLabel("Auto Replied");
		label = GmailApp.getUserLabelByName("Auto Replied");
	}
  
	for (let i = 0; i < threads.length; i++) {
	    // Ignore email conversations
	    if (threads[i].getMessageCount() == 1) {          
			var msg = threads[i].getMessages()[0];
			msg.reply(re);
			label.addToThread(threads[i]);
			//GmailApp.moveThreadToArchive(threads[i]);
	    }
	}
}

function formatDate(date) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return day + ' ' + monthNames[monthIndex] + ' ' + year;
}
