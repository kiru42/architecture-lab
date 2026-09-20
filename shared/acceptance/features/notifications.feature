Feature: Task Assignment and Real-time Notifications
  As a user
  I want to assign tasks to other users
  So that they can pick them up

  Assignment is part of the shared contract. Real-time delivery needs a
  WebSocket gateway, which only some implementations provide, so it is isolated
  behind the @websocket tag and excluded from the default run.

  Scenario: An assigned task is persisted for the assignee
    Given user "dave@example.com" exists
    And user "eve@example.com" exists
    And "dave@example.com" is signed in
    And "dave@example.com" has a project "Shared Project"
    When "dave@example.com" creates task "Urgent Task" in "Shared Project"
    And "dave@example.com" assigns "Urgent Task" to "eve@example.com"
    Then the task should be assigned to "eve@example.com"

  @websocket
  Scenario: The assignee receives a real-time notification
    Given user "dave@example.com" exists
    And user "eve@example.com" exists
    And "dave@example.com" is signed in
    And "eve@example.com" is connected via WebSocket
    And "dave@example.com" has a project "Shared Project"
    When "dave@example.com" creates task "Urgent Task" in "Shared Project"
    And "dave@example.com" assigns "Urgent Task" to "eve@example.com"
    Then "eve@example.com" should receive a real-time notification about "Urgent Task"
