# OEP API - OWASP ZAP scan

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 1 |
| Medium | 1 |
| Low | 2 |
| Informational | 3 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Low | Warning |  | ZAP errors logged - see the zap.log file for details | 2    |
| Low | Warning |  | ZAP warnings logged - see the zap.log file for details | 42    |
| Info | Informational | http://localhost:5000 | Percentage of responses with status code 2xx | 68 % |
| Info | Informational | http://localhost:5000 | Percentage of responses with status code 4xx | 31 % |
| Info | Informational | http://localhost:5000 | Percentage of endpoints with content type application/json | 100 % |
| Info | Informational | http://localhost:5000 | Percentage of endpoints with method DELETE | 7 % |
| Info | Informational | http://localhost:5000 | Percentage of endpoints with method GET | 50 % |
| Info | Informational | http://localhost:5000 | Percentage of endpoints with method PATCH | 3 % |
| Info | Informational | http://localhost:5000 | Percentage of endpoints with method POST | 34 % |
| Info | Informational | http://localhost:5000 | Percentage of endpoints with method PUT | 3 % |
| Info | Informational | http://localhost:5000 | Count of total endpoints | 26    |
| Info | Informational | http://localhost:5000 | Percentage of slow responses | 50 % |




## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| SQL Injection - SQLite (Time Based) | High | 2 |
| Application Error Disclosure | Medium | 3 |
| Cross Site Scripting Weakness (Persistent in JSON Response) | Low | 9 |
| Information Disclosure - Debug Error Messages | Low | 3 |
| Authentication Request Identified | Informational | 1 |
| Session Management Response Identified | Informational | 1 |
| User Agent Fuzzer | Informational | Systemic |




## Alert Detail



### [ SQL Injection - SQLite (Time Based) ](https://www.zaproxy.org/docs/alerts/40024/)



##### High (Medium)

### Description

SQL injection may be possible.

* URL: http://localhost:5000/api/eval/exams/2/my-scorecard
  * Node Name: `http://localhost:5000/api/eval/exams/case randomblob(100000000) when not null then 1 else 1 end /my-scorecard`
  * Method: `GET`
  * Parameter: `«examId»`
  * Attack: `case randomblob(100000000) when not null then 1 else 1 end `
  * Evidence: ``
  * Other Info: `The query time is controllable using parameter value [case randomblob(100000000) when not null then 1 else 1 end ], which caused the request to take [284] milliseconds, parameter value [case randomblob(1000000000) when not null then 1 else 1 end ], which caused the request to take [290] milliseconds, when the original unmodified query with value [2] took [6] milliseconds.`
* URL: http://localhost:5000/api/auth/reset-password/verify
  * Node Name: `http://localhost:5000/api/auth/reset-password/verify ()({email,otp,newPassword})`
  * Method: `POST`
  * Parameter: `otp`
  * Attack: `case randomblob(100000000) when not null then 1 else 1 end `
  * Evidence: ``
  * Other Info: `The query time is controllable using parameter value [case randomblob(100000000) when not null then 1 else 1 end ], which caused the request to take [188] milliseconds, parameter value [case randomblob(1000000000) when not null then 1 else 1 end ], which caused the request to take [296] milliseconds, when the original unmodified query with value [123456] took [11] milliseconds.`


Instances: 2

### Solution

Do not trust client side input, even if there is client side validation in place.
In general, type check all data on the server side.
If the application uses JDBC, use PreparedStatement or CallableStatement, with parameters passed by '?'
If the application uses ASP, use ADO Command Objects with strong type checking and parameterized queries.
If database Stored Procedures can be used, use them.
Do *not* concatenate strings into queries in the stored procedure, or use 'exec', 'exec immediate', or equivalent functionality!
Do not create dynamic SQL queries using simple string concatenation.
Escape all data received from the client.
Apply an 'allow list' of allowed characters, or a 'deny list' of disallowed characters in user input.
Apply the principle of least privilege by using the least privileged database user possible.
In particular, avoid using the 'sa' or 'db-owner' database users. This does not eliminate SQL injection, but minimizes its impact.
Grant the minimum database access that is necessary for the application.

### Reference


* [ https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html ](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)


#### CWE Id: [ 89 ](https://cwe.mitre.org/data/definitions/89.html)


#### WASC Id: 19

#### Source ID: 1

### [ Application Error Disclosure ](https://www.zaproxy.org/docs/alerts/90022/)



##### Medium (Medium)

### Description

This page contains an error/warning message that may disclose sensitive information like the location of the file that produced the unhandled exception. This information can be used to launch further attacks against the web application. The alert could be a false positive if the error message is found inside a documentation page.

* URL: http://localhost:5000/api/delivery/exams/1/attempt
  * Node Name: `http://localhost:5000/api/delivery/exams/1/attempt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Internal Server Error`
  * Other Info: ``
* URL: http://localhost:5000/api/exams/questions
  * Node Name: `http://localhost:5000/api/exams/questions`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Internal Server Error`
  * Other Info: ``
* URL: http://localhost:5000/api/exams/questions/bank
  * Node Name: `http://localhost:5000/api/exams/questions/bank`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Internal Server Error`
  * Other Info: ``


Instances: 3

### Solution

Review the source code of this page. Implement custom error pages. Consider implementing a mechanism to provide a unique error reference/identifier to the client (browser) while logging the details on the server side and not exposing them to the user.

### Reference



#### CWE Id: [ 550 ](https://cwe.mitre.org/data/definitions/550.html)


#### WASC Id: 13

#### Source ID: 3

### [ Cross Site Scripting Weakness (Persistent in JSON Response) ](https://www.zaproxy.org/docs/alerts/40014/)



##### Low (Low)

### Description

A XSS attack was found in a JSON response, this might leave content consumers vulnerable to attack if they don't appropriately handle the data (response).

* URL: http://localhost:5000/api/audit-logs
  * Node Name: `http://localhost:5000/api/audit-logs`
  * Method: `GET`
  * Parameter: `email`
  * Attack: `<script>alert(1);</script>`
  * Evidence: ``
  * Other Info: `Raised with LOW confidence as the Content-Type is not HTML.`
* URL: http://localhost:5000/api/audit-logs
  * Node Name: `http://localhost:5000/api/audit-logs`
  * Method: `GET`
  * Parameter: `«id»`
  * Attack: `<script>alert(1);</script>`
  * Evidence: ``
  * Other Info: `Raised with LOW confidence as the Content-Type is not HTML.`
* URL: http://localhost:5000/api/exams
  * Node Name: `http://localhost:5000/api/exams`
  * Method: `GET`
  * Parameter: `description`
  * Attack: `<script>alert(1);</script>`
  * Evidence: ``
  * Other Info: `Raised with LOW confidence as the Content-Type is not HTML.`
* URL: http://localhost:5000/api/exams
  * Node Name: `http://localhost:5000/api/exams`
  * Method: `GET`
  * Parameter: `title`
  * Attack: `<script>alert(1);</script>`
  * Evidence: ``
  * Other Info: `Raised with LOW confidence as the Content-Type is not HTML.`
* URL: http://localhost:5000/api/exams/questions
  * Node Name: `http://localhost:5000/api/exams/questions`
  * Method: `GET`
  * Parameter: `correct_answer`
  * Attack: `<script>alert(1);</script>`
  * Evidence: ``
  * Other Info: `Raised with LOW confidence as the Content-Type is not HTML.`
* URL: http://localhost:5000/api/exams/questions
  * Node Name: `http://localhost:5000/api/exams/questions`
  * Method: `GET`
  * Parameter: `explanation`
  * Attack: `<script>alert(1);</script>`
  * Evidence: ``
  * Other Info: `Raised with LOW confidence as the Content-Type is not HTML.`
* URL: http://localhost:5000/api/exams/questions
  * Node Name: `http://localhost:5000/api/exams/questions`
  * Method: `GET`
  * Parameter: `option_text`
  * Attack: `<script>alert(1);</script>`
  * Evidence: ``
  * Other Info: `Raised with LOW confidence as the Content-Type is not HTML.`
* URL: http://localhost:5000/api/exams/questions/bank
  * Node Name: `http://localhost:5000/api/exams/questions/bank`
  * Method: `GET`
  * Parameter: `option_key`
  * Attack: `<script>alert(1);</script>`
  * Evidence: ``
  * Other Info: `Raised with LOW confidence as the Content-Type is not HTML.`
* URL: http://localhost:5000/api/exams/questions/bank
  * Node Name: `http://localhost:5000/api/exams/questions/bank`
  * Method: `GET`
  * Parameter: `question_text`
  * Attack: `<script>alert(1);</script>`
  * Evidence: ``
  * Other Info: `Raised with LOW confidence as the Content-Type is not HTML.`


Instances: 9

### Solution

Phase: Architecture and Design
Use a vetted library or framework that does not allow this weakness to occur or provides constructs that make this weakness easier to avoid.
Examples of libraries and frameworks that make it easier to generate properly encoded output include Microsoft's Anti-XSS library, the OWASP ESAPI Encoding module, and Apache Wicket.

Phases: Implementation; Architecture and Design
Understand the context in which your data will be used and the encoding that will be expected. This is especially important when transmitting data between different components, or when generating outputs that can contain multiple encodings at the same time, such as web pages or multi-part mail messages. Study all expected communication protocols and data representations to determine the required encoding strategies.
For any data that will be output to another web page, especially any data that was received from external inputs, use the appropriate encoding on all non-alphanumeric characters.
Consult the XSS Prevention Cheat Sheet for more details on the types of encoding and escaping that are needed.

Phase: Architecture and Design
For any security checks that are performed on the client side, ensure that these checks are duplicated on the server side, in order to avoid CWE-602. Attackers can bypass the client-side checks by modifying values after the checks have been performed, or by changing the client to remove the client-side checks entirely. Then, these modified values would be submitted to the server.

If available, use structured mechanisms that automatically enforce the separation between data and code. These mechanisms may be able to provide the relevant quoting, encoding, and validation automatically, instead of relying on the developer to provide this capability at every point where output is generated.

Phase: Implementation
For every web page that is generated, use and specify a character encoding such as ISO-8859-1 or UTF-8. When an encoding is not specified, the web browser may choose a different encoding by guessing which encoding is actually being used by the web page. This can cause the web browser to treat certain sequences as special, opening up the client to subtle XSS attacks. See CWE-116 for more mitigations related to encoding/escaping.

To help mitigate XSS attacks against the user's session cookie, set the session cookie to be HttpOnly. In browsers that support the HttpOnly feature (such as more recent versions of Internet Explorer and Firefox), this attribute can prevent the user's session cookie from being accessible to malicious client-side scripts that use document.cookie. This is not a complete solution, since HttpOnly is not supported by all browsers. More importantly, XMLHTTPRequest and other powerful browser technologies provide read access to HTTP headers, including the Set-Cookie header in which the HttpOnly flag is set.

Assume all input is malicious. Use an "accept known good" input validation strategy, i.e., use an allow list of acceptable inputs that strictly conform to specifications. Reject any input that does not strictly conform to specifications, or transform it into something that does. Do not rely exclusively on looking for malicious or malformed inputs (i.e., do not rely on a deny list). However, deny lists can be useful for detecting potential attacks or determining which inputs are so malformed that they should be rejected outright.

When performing input validation, consider all potentially relevant properties, including length, type of input, the full range of acceptable values, missing or extra inputs, syntax, consistency across related fields, and conformance to business rules. As an example of business rule logic, "boat" may be syntactically valid because it only contains alphanumeric characters, but it is not valid if you are expecting colors such as "red" or "blue."

Ensure that you perform input validation at well-defined interfaces within the application. This will help protect the application even if a component is reused or moved elsewhere.
	

### Reference


* [ https://owasp.org/www-community/attacks/xss/ ](https://owasp.org/www-community/attacks/xss/)
* [ https://cwe.mitre.org/data/definitions/79.html ](https://cwe.mitre.org/data/definitions/79.html)


#### CWE Id: [ 79 ](https://cwe.mitre.org/data/definitions/79.html)


#### WASC Id: 8

#### Source ID: 1

### [ Information Disclosure - Debug Error Messages ](https://www.zaproxy.org/docs/alerts/10023/)



##### Low (Medium)

### Description

The response appeared to contain common error messages returned by platforms such as ASP.NET, and Web-servers such as IIS and Apache. You can configure the list of common debug messages.

* URL: http://localhost:5000/api/delivery/exams/1/attempt
  * Node Name: `http://localhost:5000/api/delivery/exams/1/attempt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Internal Server Error`
  * Other Info: ``
* URL: http://localhost:5000/api/exams/questions
  * Node Name: `http://localhost:5000/api/exams/questions`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Internal Server Error`
  * Other Info: ``
* URL: http://localhost:5000/api/exams/questions/bank
  * Node Name: `http://localhost:5000/api/exams/questions/bank`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Internal Server Error`
  * Other Info: ``


Instances: 3

### Solution

Disable debugging messages before pushing to production.

### Reference



#### CWE Id: [ 1295 ](https://cwe.mitre.org/data/definitions/1295.html)


#### WASC Id: 13

#### Source ID: 3

### [ Authentication Request Identified ](https://www.zaproxy.org/docs/alerts/10111/)



##### Informational (Low)

### Description

The given request has been identified as an authentication request. The 'Other Info' field contains a set of key=value lines which identify any relevant fields. If the request is in a context which has an Authentication Method set to "Auto-Detect" then this rule will change the authentication to match the request identified.

* URL: http://localhost:5000/api/auth/reset-password/verify
  * Node Name: `http://localhost:5000/api/auth/reset-password/verify ()({email,otp,newPassword})`
  * Method: `POST`
  * Parameter: `email`
  * Attack: ``
  * Evidence: `newPassword`
  * Other Info: `userParam=email
userValue=zaproxy@example.com
passwordParam=newPassword`


Instances: 1

### Solution

This is an informational alert rather than a vulnerability and so there is nothing to fix.

### Reference


* [ https://www.zaproxy.org/docs/desktop/addons/authentication-helper/auth-req-id/ ](https://www.zaproxy.org/docs/desktop/addons/authentication-helper/auth-req-id/)



#### Source ID: 3

### [ Session Management Response Identified ](https://www.zaproxy.org/docs/alerts/10112/)



##### Informational (Medium)

### Description

The given response has been identified as containing a session management token. The 'Other Info' field contains a set of header tokens that can be used in the Header Based Session Management Method. If the request is in a context which has a Session Management Method set to "Auto-Detect" then this rule will change the session management to use the tokens identified.

* URL: http://localhost:5000/api/auth/login
  * Node Name: `http://localhost:5000/api/auth/login ()({email,password})`
  * Method: `POST`
  * Parameter: `token`
  * Attack: ``
  * Evidence: `token`
  * Other Info: `json:token`


Instances: 1

### Solution

This is an informational alert rather than a vulnerability and so there is nothing to fix.

### Reference


* [ https://www.zaproxy.org/docs/desktop/addons/authentication-helper/session-mgmt-id/ ](https://www.zaproxy.org/docs/desktop/addons/authentication-helper/session-mgmt-id/)



#### Source ID: 3

### [ User Agent Fuzzer ](https://www.zaproxy.org/docs/alerts/10104/)



##### Informational (Medium)

### Description

Check for differences in response based on fuzzed User Agent (eg. mobile sites, access as a Search Engine Crawler). Compares the response statuscode and the hashcode of the response body with the original response.

* URL: http://localhost:5000/api/auth/login
  * Node Name: `http://localhost:5000/api/auth/login ()({email,password})`
  * Method: `POST`
  * Parameter: `Header User-Agent`
  * Attack: `Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)`
  * Evidence: ``
  * Other Info: ``
* URL: http://localhost:5000/api/auth/register
  * Node Name: `http://localhost:5000/api/auth/register ()({name,email,password,role})`
  * Method: `POST`
  * Parameter: `Header User-Agent`
  * Attack: `Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)`
  * Evidence: ``
  * Other Info: ``
* URL: http://localhost:5000/api/auth/register
  * Node Name: `http://localhost:5000/api/auth/register ()({name,email,password,role})`
  * Method: `POST`
  * Parameter: `Header User-Agent`
  * Attack: `Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)`
  * Evidence: ``
  * Other Info: ``

Instances: Systemic


### Solution



### Reference


* [ https://owasp.org/wstg ](https://owasp.org/wstg)



#### Source ID: 1


