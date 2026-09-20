Feature: Task Comments
  As a user
  I want to comment on tasks in my projects
  So that I can keep context next to the work

  Comments are scoped to a task, and a task is reachable only through the
  project that owns it. Every implementation enforces that rule.

  Scenario: The project owner comments on a task and reads the comment back
    Given user "frank@example.com" exists
    And "frank@example.com" has a project "Discussion Project" with task "Discussion Task"
    When "frank@example.com" comments "This is important" on "Discussion Task"
    And "frank@example.com" views the comments on "Discussion Task"
    Then "frank@example.com" should see the comment "This is important"

  Scenario: A user who does not own the project is denied access
    Given user "frank@example.com" exists
    And user "grace@example.com" exists
    And "frank@example.com" has a project "Discussion Project" with task "Discussion Task"
    When "grace@example.com" tries to view the comments on "Discussion Task"
    Then access should be denied with a 403
