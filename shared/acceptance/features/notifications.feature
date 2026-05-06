Feature: Task Assignment and Real-time Notifications
  As a user
  I want to assign tasks to other users
  So that they receive real-time notifications

  Background:
    Given user "dave@example.com" exists
    And user "eve@example.com" exists
    And "dave@example.com" is signed in
    And "eve@example.com" is connected via WebSocket

  Scenario: User assigns task and assignee receives notification
    Given "dave@example.com" has a project "Shared Project"
    When "dave@example.com" creates task "Urgent Task" in "Shared Project"
    And "dave@example.com" assigns "Urgent Task" to "eve@example.com"
    Then "eve@example.com" should receive a real-time notification about "Urgent Task"
