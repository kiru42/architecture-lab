Feature: Task Comments
  As a user
  I want to comment on tasks
  So that I can collaborate with others

  Background:
    Given user "frank@example.com" exists
    And user "grace@example.com" exists
    And "frank@example.com" has a project "Discussion Project" with task "Discussion Task"

  Scenario: User comments on task and other viewer sees it
    Given "frank@example.com" is signed in
    When "frank@example.com" comments "This is important" on "Discussion Task"
    And "grace@example.com" signs in and views "Discussion Task"
    Then "grace@example.com" should see the comment "This is important"
