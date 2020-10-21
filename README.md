# README

## Files
-	TDL-Tests: Includes the basic structure of the tests plus the implementation of some different logic controllers to better understand how they work.
-	TDL-mainTests: Includes the Load, Soak, Stress and Spike tests, each one presented in a different thread. All individual tests are wrapped in sample controllers for a more structured program: Create, read, update and delete (CRUD functionality)

## Tests (tasks and to do lists):
-	Create: Post request that is asserted using a JSON assertion (making sure what it has been sent matches the output). A JSON extractor is used to recover the id of the task/list and store it in a new variable so that it can be used later on when implementing update and delete.
-	Read: Get request that is asserted using a response assertion (Status 200).
-	Update: Put request that takes the id recovered from the create method and updates the task/list. As it implies us sending data in a JSON format a Header manager is included within the request. A JSON assertion is used to make sure that the update has worked.
-	Delete: Delete request that takes as input the id recovered from the create method and deletes a list/task. In order to check that the request has worked, a response assertion (Status 204) is used.

**Timers:** We have used constant timers to represent the time a user would spend before each task (e.g.: In case of deleting it cannot be longer than a second, however, updating a task can take anywhere from 5 to 20 seconds)

## HTML Results: 
The results are present for stress, load and spike testing. There are two sets of results for each test, the first ones for the tests without timers and the second on for the tests with timers (e.g.: Stress2).

## Throughput: 
Regarding throughput, the lowest values are presented in the spike test, due to the higher load of users in a short amount of time. 

## Errors: 
All three tests (spike, load and stress) present errors when there are no timers present. This can be caused by a lack of time between actions (e.g. The read method has been executed but the create task has not gone through yet). This is especially noticeable when dealing with load and soak testing, as the number of users is sustained over a long period of time. When timers were added, the number of errors drop to 0 in the spike, load and stress test, but the soak test still presented a small percentage of error.
