Feature: User Authentication
  As a new user
  I want to sign up, sign in, and view my profile
  So that I can access the TaskFlow application

  Scenario: New user signs up and sees empty dashboard
    Given I am a new user with email "alice@example.com"
    When I sign up with name "Alice" and password "SecurePass123"
    Then I should be authenticated
    And I should see an empty project list

  Scenario: User signs in with wrong credentials
    Given a user exists with email "bob@example.com" and password "RealPassword"
    When I try to sign in with email "bob@example.com" and password "WrongPassword"
    Then I should see an authentication error
    And I should not be authenticated
