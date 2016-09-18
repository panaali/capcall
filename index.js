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
var requirejs = require('requirejs');

// Load Nessie 
requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});


require.config({
    baseUrl: 'lib_nessie/',
    context: VERSION,
    bundles: {
        'main': ['capital_one', 'account', 'bills', 'atm', 'branch', 'customer', 'deposit', 'withdrawal','merchant', 'purchase', 'transfer']
    }
});

require(['account', 'atm', 'bills', 'branch', 'customer', 'deposit', 'withdrawal', 'merchant', 'purchase', 'transfer']);

define('capital_one', function() {
    "use strict";
    var Config = {
        baseUrl: 'http://api.reimaginebanking.com:80',
        apiKey: function() {
            return this.apiKey;
        },
        setApiKey: function(apiKey) {
            this.apiKey = apiKey;
        }
    };
    return Config;
});
var apiKey = '48dde91a66abb51288c608d269c6bb36';
// set the modules being used
require(['customer'], function (customer) {
    // initialize customer and account
    var cust = customer.initWithKey(apiKey);

    // make the API Calls
    // postCustomer(apiKey, cust);
    getCustomer(apiKey, cust);
});

function getCustomer (key, cust) {
    var allCustomers = cust.getCustomers();
    var myCustomer = null;

    // loop through all customers and log their info
    console.log("[Customer - Get All Customers]");
    for (var i = 0; i < allCustomers.length; i++) {
        var firstName = allCustomers[i].first_name;
        var lastName = allCustomers[i].last_name;
        console.log("Customer[" + i + "]: " + firstName + " " + lastName);

        // take note of the customer we created
        if(firstName == customerFirstName && lastName == customerLastName) {
          myCustomer = allCustomers[i];
        }
    }
    // display the customer we created
    var fullName = myCustomer.first_name + " " + myCustomer.last_name
    console.log("[Customer - My Customer] " + fullName);
}
// Nessie Load End

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

        // var options = {
        //   host: 'api.reimaginebanking.com',
        //   port: '80',
        //   path: '/atms',
        //   method: 'GET',
        //   // headers: {
        //   //   'Content-Type': 'application/x-www-form-urlencoded',
        //   //   'Content-Length': post_data.length
        //   // }
        // };

        // var req = http.request(options, function(res) {
        //   // response is here
        //   console.log(res);
        //   var x = JSON.parse(res);
        //   response.tellWithCard("The nearest ATM is in Here");
        // });

        // write the request parameters
        // req.write('lat=38.9283&lng=-77.1753&rad=1&key=48dde91a66abb51288c608d269c6bb36');
        // req.end();
    },

    "NearestATMWithLangIntent": function (intent, session, response) {
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
        });
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("Say the ATM name you're looking for!", "You can say hello to me!");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var helloWorld = new HelloWorld();
    helloWorld.execute(event, context);
};

