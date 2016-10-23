# siqstory-collector

a serverless setup that can receive siqstories from the [SiqStory Journalist](http://github.com/relateiq/siqstory-journalist ""). It's setup with sequelize but you would need to configure it to use your own aws creds and create the file `.dbconfig.js` to supply a link to the sequelize constructor.

this instance handles downloading any css from the recorded mutations and posting it to s3 for later consumption when the story is being retold by [SiqStory Teller](http://github.com/relateiq/siqstory-teller "") 

todo
----
* download fonts and images and post to s3
* update endpoint to add twists to a story instead of always clobbering
* queryable endpoints instead of just getLastStory
