var express = require('express'),
    router = express.Router(),
    fs = require('fs');

router.get('/', function(req, res, next) {

    var Twitter = require('twitter'),
        VoiceText = require('voicetext'),
        Config = require('config');

    var client = new Twitter({
            consumer_key: Config.TWITTER_CONSUMER_KEY,
            consumer_secret: Config.TWITTER_CONSUMER_SECRET,
            access_token_key: Config.TWITTER_ACCESS_TOKEN_KEY,
            access_token_secret: Config.TWITTER_ACCESS_TOKEN_SECRET
        }),
        voice = new VoiceText(Config.VOICE_TEXT);

    client.get('/search/tweets', {
            q: '@dave_spector-filter:retweets',
            count: 100
        }, function(error, tweet, response) {
            var num = Math.floor(Math.random() * (tweet.statuses.length + 1));
            console.log(num, tweet.statuses.length);
            var text = tweet.statuses[num].text;
            text = text.replace(/[!"#$%&'()\*\+\-\.,\/:;<=>?@\[\\\]^_`{|}~0-9a-zA-Z]/g, '');
            console.log(text);
            voice.speaker(voice.SPEAKER.SHOW)
                .emotion(voice.EMOTION.SADNESS)
                .emotion_level(4)
                .speak(text, function(e, buf) {
                    if (e) {
                        console.error(e);
                        res.send(500);
                        res.end();
                    }

                    var filename = '/files/' + new Date().getTime() + '.wav';
                    fs.writeFile('./public' + filename, buf, 'binary', function(error) {
                        if (error) {
                            console.error(error);
                            res.send(500);
                            res.end();
                        }

                        res.json({
                            success: true,
                            filename: filename,
                            tweet: text
                        });
                        res.end();
                    })
                });
        }
    );
});

module.exports = router;
