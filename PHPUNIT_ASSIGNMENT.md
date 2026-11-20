# Final Form — PHPUnit Unit Test Assignment

This is a standalone PHP exercise related to Final Form's fitness domain. The main Final Form application uses React, TypeScript, and Supabase; this assignment does not change its runtime.

## Function

`php/BmiCalculator.php` calculates body mass index (BMI) from weight in kilograms and height in meters:

`BMI = weightKg / (heightM * heightM)`

It rounds the result to two decimal places and throws `InvalidArgumentException` when weight or height is missing, zero, negative, or non-finite.

## PHPUnit tests

`tests/BmiCalculatorTest.php` includes three tests:

1. **Normal input:** 80 kg and 1.8 m returns 24.69.
2. **Empty input:** missing weight raises an exception.
3. **Bad input:** height of zero raises an exception.

## Run

Install PHP 8.3 and Composer, then from the repository root:

```bash
composer install
composer test
```

The GitHub Actions workflow `PHPUnit Assignment` installs PHPUnit with Composer and runs the tests on GitHub.

**Note:** This is an isolated PHP exercise for the course, not an existing PHP function in the production app.
