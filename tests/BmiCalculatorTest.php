<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../php/BmiCalculator.php';

final class BmiCalculatorTest extends TestCase
{
    public function testNormalInput(): void
    {
        $this->assertEqualsWithDelta(24.69, BmiCalculator::calculate(80.0, 1.8), 0.001);
    }

    public function testEmptyInput(): void
    {
        $this->expectException(InvalidArgumentException::class);
        BmiCalculator::calculate(null, 1.8);
    }

    public function testBadInput(): void
    {
        $this->expectException(InvalidArgumentException::class);
        BmiCalculator::calculate(80.0, 0.0);
    }
}
