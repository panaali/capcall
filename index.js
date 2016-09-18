/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, tell Hello World to say hello"
 *  Alexa: "Hello World!"
 */

/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var http = require('http');
var https = require('https');
var request = require('request');
var _ = require('underscore');

/**
 * HelloWorld is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var HelloWorld = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
HelloWorld.prototype = Object.create(AlexaSkill.prototype);
HelloWorld.prototype.constructor = HelloWorld;

HelloWorld.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("HelloWorld onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

HelloWorld.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("HelloWorld onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to the Capital One Echo branch, you can say ATMS, ";
    var repromptText = "You can say ATMS";
    response.ask(speechOutput, repromptText);
};

HelloWorld.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("HelloWorld onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

HelloWorld.prototype.intentHandlers = {
    // register custom intent handlers
    "HelloWorldIntent": function (intent, session, response) {
        response.tellWithCard("Hello World!", "Hello World", "Hello World!");
    },
    "NearestATMIntent": function (intent, session, response) {
        //This is where we call nessie Api, and return the appropriate response
        request('http://api.reimaginebanking.com/atms?lat=38.9283&lng=-77.1753&rad=1&key=48dde91a66abb51288c608d269c6bb36', function (error, responseHttp, body) {
          if (!error && responseHttp.statusCode == 200) {
            bodyJSON = JSON.parse(body);
            if(bodyJSON.data[0]){
                response.tellWithCard("The nearest ATM is at " + bodyJSON.data[0].address.street_number + " " + bodyJSON.data[0].address.street_name +" "+ bodyJSON.data[0].address.city);
                //_.findWhere(publicServicePulitzers, {newsroom: "The New York Times"});

            }else{
                response.tellWithCard("I can't find any ATM around here.");
            }
          }
        })
    },

    "NearestBranchIntent": function (intent, session, response) {
        //This is where we call nessie Api, and return the appropriate response
        request('http://api.reimaginebanking.com/branches?lat=38.9283&lng=-77.1753&rad=1&key=48dde91a66abb51288c608d269c6bb36', function (error, responseHttp, body) {
          if (!error && responseHttp.statusCode == 200) {
            bodyJSON = JSON.parse(body);
            if(bodyJSON[0]){
                response.tellWithCard("The nearest Branch is at " + bodyJSON[0].address.street_number + " " + bodyJSON[0].address.street_name +" "+ bodyJSON[0].address.city);
                //_.findWhere(publicServicePulitzers, {newsroom: "The New York Times"});

            }else{
                response.tellWithCard("I can't find any Branch around here.");
            }
          }
        })
    },

    "AmountIntent": function (intent, session, response) {
        //This is where we call nessie Api, and return the appropriate response
        request('http://api.reimaginebanking.com/accounts?type=Checking&key=48dde91a66abb51288c608d269c6bb36', function (error, responseHttp, body) {
          if (!error && responseHttp.statusCode == 200) {
            bodyJSON = JSON.parse(body);
            if(bodyJSON[0]){
                response.tellWithCard("You have " + bodyJSON[0].balance + " dollar in your " + bodyJSON[0].nickname+ " account");
                //_.findWhere(publicServicePulitzers, {newsroom: "The New York Times"});

            }else{
                response.tellWithCard("I can't find any Branch around here.");
            }
          }
        })
    },

    "NearestATMWithLangIntent": function (intent, session, response) {
        request('http://api.reimaginebanking.com/atms?key=48dde91a66abb51288c608d269c6bb36', function (error, responseHttp, body) {
          if (!error && responseHttp.statusCode == 200) {
            bodyJSON = JSON.parse(body);
            if(bodyJSON.data.length){
                var newBody = _.filter(bodyJSON.data, function(atm){ return _.indexOf( atm.language_list, intent.slots.language.value ) !== -1 });
                response.tellWithCard("The nearest ATM is at " + newBody[0].address.street_number + " " + newBody[0].address.street_name +" "+ newBody[0].address.city);

            }else{
                response.tellWithCard("I can't find any ATM around here.");
            }
          } else {
                console.log('error' ,error);
                console.log('body:' ,body);
                console.log('responseHttp.statusCode: ' ,responseHttp.statusCode);
          }
        });
    },
    "NearestATMWithZipcodeIntent": function (intent, session, response) {
        var zipcode = intent.slots.zipcode.value;
        if (zipcode){
            request('http://maps.googleapis.com/maps/api/geocode/json?address=' + zipcode + '&sensor=true', function (error, responseHttp, body) {
              if (!error && responseHttp.statusCode == 200) {
                bodyJSON = JSON.parse(body);
                console.log('bodyJSON : ', bodyJSON);
                if(bodyJSON.results.length){
                    var location = bodyJSON.results[0].geometry.location;
                    console.log('location : ',location);
                    console.log('URL for ', 'http://api.reimaginebanking.com/atms?lat=' +  location.lat +'&lng=' +  location.lng +'&rad=5&key=48dde91a66abb51288c608d269c6bb36');
                    request('http://api.reimaginebanking.com/atms?lat=' +  location.lat +'&lng=' +  location.lng +'&rad=5&key=48dde91a66abb51288c608d269c6bb36', function (error, responseHttp, body) {
                  if (!error && responseHttp.statusCode == 200) {
                    bodyJSON = JSON.parse(body);
                    if(bodyJSON.data[0]){
                        response.tellWithCard("The nearest ATM is at " + bodyJSON.data[0].address.street_number + " " + bodyJSON.data[0].address.street_name +" "+ bodyJSON.data[0].address.city);

                        }else{
                            response.tellWithCard("I can't find any ATM around here.");
                        }
                      }
                    });
                }else{
                    response.tellWithCard("Please try again with your zipcode.");
                }
              }
            });
        }
    },
    "NearestBranchWithZipcodeIntent": function (intent, session, response) {
        var zipcode = intent.slots.zipcode.value;
        if (zipcode){
            request('http://maps.googleapis.com/maps/api/geocode/json?address=' + zipcode + '&sensor=true', function (error, responseHttp, body) {
              if (!error && responseHttp.statusCode == 200) {
                bodyJSON = JSON.parse(body);
                if(bodyJSON.results.length){
                    var location = bodyJSON.results[0].geometry.location;
                    request('http://api.reimaginebanking.com/branches?lat=' +  location.lat +'&lng=' +  location.lng +'&rad=5&key=48dde91a66abb51288c608d269c6bb36', function (error, responseHttp, body) {
                  if (!error && responseHttp.statusCode == 200) {
                    bodyJSON = JSON.parse(body);
                    if(bodyJSON[0]){
                        response.tellWithCard("The nearest ATM is at " + bodyJSON[0].address.street_number + " " + bodyJSON[0].address.street_name +" "+ bodyJSON[0].address.city);

                        }else{
                            response.tellWithCard("I can't find any ATM around here.");
                        }
                      }
                    });
                }else{
                    response.tellWithCard("Please try again with your zipcode.");
                }
              }
            });
        }
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("Say the ATM name you're looking for!");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var helloWorld = new HelloWorld();
    helloWorld.execute(event, context);
};

