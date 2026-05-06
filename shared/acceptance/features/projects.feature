Feature: Project and Task Management
  As a user
  I want to create projects and tasks
  So that I can organize my work

  Background:
    Given I am signed in as "charlie@example.com"

  Scenario: User creates project and adds three tasks
    When I create a project named "My Project"
    And I add a task "Task 1" to the project
    And I add a task "Task 2" to the project
    And I add a task "Task 3" to the project
    And I mark "Task 1" as complete
    Then the project should have 3 tasks
    And "Task 1" should be marked as complete
    And "Task 2" should not be marked as complete
