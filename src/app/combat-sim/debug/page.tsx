'use client';

import React, {useState, useEffect, useMemo} from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import {AlertTriangle, CheckCircle, XCircle, Shield, ShieldOff, Download, Play, RefreshCw} from 'lucide-react';
import {SingleShotTestCase, TestRunResult, TestSummary} from '../utils/test-types';
import {fetchItemsData} from '@/services/ItemService';
import {isWeapon, isAmmunition, isArmor} from '../utils/types';
import {calculateShotDamage} from '../utils/damage-calculations';
import testData from '@/../public/data/combat-sim-test-data.json';
import {getRarityColorClass} from "@/types/items";
import "../utils/combat-test-helper"

export default function CombatSimDebugPage() {
    const [testCases, setTestCases] = useState<SingleShotTestCase[]>([]);
    const [testResults, setTestResults] = useState<TestRunResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<TestSummary | null>(null);
    const [filterPenetrating, setFilterPenetrating] = useState<'all' | 'penetrating' | 'non-penetrating'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed'>('all');
    const [filterArmor, setFilterArmor] = useState<string>('all');
    const [filterAmmo, setFilterAmmo] = useState<string>('all');

    const filteredResults = useMemo(() => {
        return testResults.filter(result => {
            // Filter by penetration
            if (filterPenetrating === 'penetrating' && !result.testCase.isPenetration) return false;
            if (filterPenetrating === 'non-penetrating' && result.testCase.isPenetration) return false;

            // Filter by status
            if (filterStatus === 'passed' && !result.passed) return false;
            if (filterStatus === 'failed' && result.passed) return false;

            // Filter by armor
            if (filterArmor !== 'all' && result.testCase.armor.id !== filterArmor) return false;

            // Filter by ammo
            if (filterAmmo !== 'all' && result.testCase.ammo !== filterAmmo) return false;

            return true;
        });
    }, [testResults, filterPenetrating, filterStatus, filterArmor, filterAmmo]);

    // Get unique armor and ammo types for filter dropdowns
    const uniqueArmors = useMemo(() =>
            [...new Set(testCases.map(tc => tc.armor.id))].sort(),
        [testCases]
    );

    const uniqueAmmos = useMemo(() =>
            [...new Set(testCases.map(tc => tc.ammo))].sort(),
        [testCases]
    );

    // Load items and test data
    useEffect(() => {
        const loadData = async () => {
            try {
                const itemsData = await fetchItemsData();
                setItems(itemsData);
                setTestCases(testData.singleShotTestCases);
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        calculateSummary(filteredResults)
    }, [filteredResults]);



    // Run single test
    const  runSingleTest = (testCase: SingleShotTestCase): TestRunResult => {
        // Find items
        const weapon = items.find(item => item.id === testCase.weapon && isWeapon(item));
        const ammo = items.find(item => item.id === testCase.ammo && isAmmunition(item));
        const armor = items.find(item => item.id === testCase.armor.id && isArmor(item));

        if (!weapon || !ammo || !armor) {
            console.error('Missing items for test:', testCase.id);
            return {
                testCase,
                passed: false,
                simulatedResults: {armorDamage: 0, bodyDamage: 0},
                deviation: {
                    armorDamage: {absolute: 0, percentage: 0},
                    bodyDamage: {absolute: 0, percentage: 0}
                },
                accuracy: 0
            };
        }


        const currentDurability = testCase.armor.currentDurability ?? armor.stats.maxDurability;

        // Run simulation
        const shotResult = calculateShotDamage(
            ammo.stats,
            armor.stats,
            currentDurability,
            testCase.range,
            testCase.isPenetration
        );

        // Calculate deviations
        const armorDamageDeviation = testCase.gameResults.armorDamage == null ? 0 : (shotResult.damageToArmor - testCase.gameResults.armorDamage);
        const bodyDamageDeviation = (shotResult.damageToBodyPart - testCase.gameResults.bodyDamage);

        const armorDamageDeviationPercent = testCase.gameResults.armorDamage == null ? 0 : (armorDamageDeviation / testCase.gameResults.armorDamage) * 100;
        const bodyDamageDeviationPercent = (bodyDamageDeviation / testCase.gameResults.bodyDamage) * 100;

        // Calculate overall accuracy (inverse of average deviation)
        const avgDeviationPercent = testCase.gameResults.armorDamage == null ? Math.abs(bodyDamageDeviationPercent) : (Math.abs(armorDamageDeviationPercent) + Math.abs(bodyDamageDeviationPercent)) / 2;
        const accuracy = Math.max(0, 100 - avgDeviationPercent);

        // Consider test passed if accuracy > 80%
        const passed = accuracy > 90;

        return {
            testCase,
            passed,
            ammo,
            weapon,
            armor,
            simulatedResults: {
                armorDamage: shotResult.damageToArmor,
                bodyDamage: shotResult.damageToBodyPart
            },
            deviation: {
                armorDamage: {
                    absolute: armorDamageDeviation,
                    percentage: armorDamageDeviationPercent
                },
                bodyDamage: {
                    absolute: bodyDamageDeviation,
                    percentage: bodyDamageDeviationPercent
                }
            },
            accuracy
        };
    };

    // Run all tests
    const runAllTests = () => {
        setIsRunning(true);
        const results: TestRunResult[] = [];

        for (const testCase of testCases) {
            results.push(runSingleTest(testCase));
        }

        setTestResults(results);
        calculateSummary(results);
        setIsRunning(false);
    };

    // Calculate summary statistics
    const calculateSummary = (results: TestRunResult[]) => {
        const totalTests = results.length;
        const passedTests = results.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        const averageAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests;

        // Group by armor
        const deviationByArmor: Record<string, any> = {};
        const deviationByAmmo: Record<string, any> = {};

        results.forEach(result => {
            const armorId = result.testCase.armor.id;
            const ammoId = result.testCase.ammo;

            // Armor grouping
            if (!deviationByArmor[armorId]) {
                deviationByArmor[armorId] = {
                    armorDamageDeviations: [],
                    bodyDamageDeviations: [],
                    testCount: 0
                };
            }
            deviationByArmor[armorId].armorDamageDeviations.push(result.deviation.armorDamage.percentage);
            deviationByArmor[armorId].bodyDamageDeviations.push(result.deviation.bodyDamage.percentage);
            deviationByArmor[armorId].testCount++;

            // Ammo grouping
            if (!deviationByAmmo[ammoId]) {
                deviationByAmmo[ammoId] = {
                    armorDamageDeviations: [],
                    bodyDamageDeviations: [],
                    testCount: 0
                };
            }
            deviationByAmmo[ammoId].armorDamageDeviations.push(result.deviation.armorDamage.percentage);
            deviationByAmmo[ammoId].bodyDamageDeviations.push(result.deviation.bodyDamage.percentage);
            deviationByAmmo[ammoId].testCount++;
        });

        // Calculate averages
        Object.keys(deviationByArmor).forEach(armorId => {
            const data = deviationByArmor[armorId];
            deviationByArmor[armorId] = {
                averageArmorDamageDeviation: data.armorDamageDeviations.reduce((a: number, b: number) => a + b, 0) / data.testCount,
                averageBodyDamageDeviation: data.bodyDamageDeviations.reduce((a: number, b: number) => a + b, 0) / data.testCount,
                testCount: data.testCount
            };
        });

        Object.keys(deviationByAmmo).forEach(ammoId => {
            const data = deviationByAmmo[ammoId];
            deviationByAmmo[ammoId] = {
                averageArmorDamageDeviation: data.armorDamageDeviations.reduce((a: number, b: number) => a + b, 0) / data.testCount,
                averageBodyDamageDeviation: data.bodyDamageDeviations.reduce((a: number, b: number) => a + b, 0) / data.testCount,
                testCount: data.testCount
            };
        });

        setSummary({
            totalTests,
            passedTests,
            failedTests,
            averageAccuracy,
            deviationByArmor,
            deviationByAmmo
        });
    };

    // Export results
    const exportResults = () => {
        const data = {
            testResults,
            summary,
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `combat-sim-test-results-${Date.now()}.json`;
        a.click();
    };

    // Get color for accuracy
    const getAccuracyColor = (accuracy: number) => {
        if (accuracy >= 95) return 'text-green-400';
        if (accuracy >= 90) return 'text-lime-400';
        if (accuracy >= 82.5) return 'text-yellow-400';
        if (accuracy >= 75) return 'text-orange-400';
        return 'text-red-400';
    };

    if (loading) {
        return (
            <Layout title="Combat Sim Debug | Exfil Zone">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-96">
                        <div
                            className="animate-spin w-12 h-12 border-4 border-olive-600 border-t-transparent rounded-full"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Combat Sim Debug | Exfil Zone">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="inline-block px-3 py-1 border border-red-500 bg-red-900/20 mb-3">
                        <h2 className="text-red-400 military-stencil flex items-center gap-2">
                            <AlertTriangle size={20}/>
                            DEBUG MODE
                        </h2>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-tan-100 mb-2 military-stencil">
                        COMBAT SIMULATOR TEST SUITE
                    </h1>
                    <p className="text-tan-300">
                        Compare in-game recorded damage values with simulated results to calibrate the damage engine.
                    </p>
                </div>

                {/* Controls */}
                <div className="military-box p-4 rounded-sm mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={runAllTests}
                            disabled={isRunning || testCases.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-olive-600 hover:bg-olive-500
                text-tan-100 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRunning ? <RefreshCw size={16} className="animate-spin"/> : <Play size={16}/>}
                            Run All Tests
                        </button>
                        <div className="text-tan-300">
                            {testCases.length} test cases loaded
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportResults}
                            disabled={testResults.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-military-700 hover:bg-military-600
                text-tan-100 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={16}/>
                            Export Results
                        </button>
                    </div>
                </div>

                {/* Summary */}
                {summary && (
                    <div className="military-box p-6 rounded-sm mb-6">
                        <h3 className="text-xl font-bold text-olive-400 mb-4">TEST SUMMARY</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="military-card p-4 rounded-sm">
                                <div className="text-tan-400 text-sm">Total Tests</div>
                                <div className="text-2xl font-bold text-tan-100">{summary.totalTests}</div>
                            </div>
                            <div className="military-card p-4 rounded-sm">
                                <div className="text-tan-400 text-sm">Passed</div>
                                <div className="text-2xl font-bold text-green-400">{summary.passedTests}</div>
                            </div>
                            <div className="military-card p-4 rounded-sm">
                                <div className="text-tan-400 text-sm">Failed</div>
                                <div className="text-2xl font-bold text-red-400">{summary.failedTests}</div>
                            </div>
                            <div className="military-card p-4 rounded-sm">
                                <div className="text-tan-400 text-sm">Avg Accuracy</div>
                                <div className={`text-2xl font-bold ${getAccuracyColor(summary.averageAccuracy)}`}>
                                    {summary.averageAccuracy.toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        {/* Deviation by Armor */}
                        <div className="mt-6">
                            <h4 className="text-lg font-bold text-olive-400 mb-3">Deviation by Armor</h4>
                            <div className="space-y-2">
                                {Object.entries(summary.deviationByArmor).map(([armorId, stats]) => (
                                    <div key={armorId} className="flex items-center justify-between text-sm">
                                        <span className="text-tan-300">{armorId}</span>
                                        <div className="flex gap-4 text-tan-100">
                                            <span>Armor: {stats.averageArmorDamageDeviation.toFixed(1)}%</span>
                                            <span>Body: {stats.averageBodyDamageDeviation.toFixed(1)}%</span>
                                            <span className="text-tan-400">({stats.testCount} tests)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {testResults.length > 0 && (
                    <div className="military-box p-4 rounded-sm mb-6">
                        <h3 className="text-sm font-bold text-olive-400 mb-3">FILTERS</h3>
                        <div className="flex flex-wrap gap-4">
                            {/* Penetration Filter */}
                            <div className="flex items-center gap-2">
                                <label className="text-tan-300 text-sm">Penetration:</label>
                                <select
                                    value={filterPenetrating}
                                    onChange={(e) => setFilterPenetrating(e.target.value as any)}
                                    className="bg-military-800 text-tan-100 px-3 py-1 rounded-sm border border-military-700
            focus:border-olive-500 focus:outline-none text-sm"
                                >
                                    <option value="all">All</option>
                                    <option value="penetrating">Penetrating</option>
                                    <option value="non-penetrating">Non-Penetrating</option>
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <label className="text-tan-300 text-sm">Status:</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as any)}
                                    className="bg-military-800 text-tan-100 px-3 py-1 rounded-sm border border-military-700
            focus:border-olive-500 focus:outline-none text-sm"
                                >
                                    <option value="all">All</option>
                                    <option value="passed">Passed Only</option>
                                    <option value="failed">Failed Only</option>
                                </select>
                            </div>

                            {/* Armor Filter */}
                            <div className="flex items-center gap-2">
                                <label className="text-tan-300 text-sm">Armor:</label>
                                <select
                                    value={filterArmor}
                                    onChange={(e) => setFilterArmor(e.target.value)}
                                    className="bg-military-800 text-tan-100 px-3 py-1 rounded-sm border border-military-700
            focus:border-olive-500 focus:outline-none text-sm"
                                >
                                    <option value="all">All Armors</option>
                                    {uniqueArmors.map(armorId => (
                                        <option key={armorId} value={armorId}>
                                            {items.find(item => item.id === armorId)?.name || armorId}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Ammo Filter */}
                            <div className="flex items-center gap-2">
                                <label className="text-tan-300 text-sm">Ammo:</label>
                                <select
                                    value={filterAmmo}
                                    onChange={(e) => setFilterAmmo(e.target.value)}
                                    className="bg-military-800 text-tan-100 px-3 py-1 rounded-sm border border-military-700
            focus:border-olive-500 focus:outline-none text-sm"
                                >
                                    <option value="all">All Ammo</option>
                                    {uniqueAmmos.map(ammoId => (
                                        <option key={ammoId} value={ammoId}>
                                            {items.find(item => item.id === ammoId)?.name || ammoId}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Results count */}
                            <div className="ml-auto text-tan-400 text-sm">
                                Showing {filteredResults.length} of {testResults.length} results
                            </div>
                        </div>
                    </div>
                )}

                {/* Test Results Table */}
                {filteredResults.length > 0 && (
                    <div className="military-box p-6 rounded-sm">
                        <h3 className="text-xl font-bold text-olive-400 mb-4">TEST RESULTS</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="border-b border-military-700 text-tan-300">
                                    <th className="text-left py-2 px-3">Test</th>
                                    <th className="text-center py-2 px-3">Status</th>
                                    <th className="text-center py-2 px-3">Pen</th>
                                    <th className="text-center py-2 px-3">Game Armor</th>
                                    <th className="text-center py-2 px-3">Sim Armor</th>
                                    <th className="text-center py-2 px-3">Dev %</th>
                                    <th className="text-center py-2 px-3">Game Body</th>
                                    <th className="text-center py-2 px-3">Sim Body</th>
                                    <th className="text-center py-2 px-3">Dev %</th>
                                    <th className="text-center py-2 px-3">Accuracy</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredResults.map((result) => (
                                    <tr key={result.testCase.id}
                                        className="border-b border-military-800 hover:bg-military-800/50">
                                        <td className="py-2 px-3">
                                            <div className="flex items-center gap-1 flex-wrap">
                                                <Link
                                                    href={`/items/${result.weapon.id}`}
                                                    className={`font-medium ${getRarityColorClass(result.weapon.stats.rarity)}`}
                                                >
                                                    {result.weapon.name}
                                                </Link>
                                                <span className="text-tan-400">+</span>
                                                <Link
                                                    href={`/items/${result.ammo.id}`}
                                                    className={`font-medium ${getRarityColorClass(result.ammo.stats.rarity)}`}
                                                >
                                                    {result.ammo.name}
                                                </Link>
                                                <span className="text-tan-400">vs</span>
                                                <Link
                                                    href={`/items/${result.armor.id}`}
                                                    className={`font-medium ${getRarityColorClass(result.armor.stats.rarity)}`}
                                                >
                                                    {result.armor.name}
                                                </Link>
                                                <span className="text-tan-400 text-xs">({result.testCase.armor.currentDurability??result.armor.stats.maxDurability})</span>
                                            </div>
                                            {result.testCase.description && (
                                                <div className="text-xs text-tan-400 mt-1">{result.testCase.description}</div>
                                            )}
                                            <div className="text-xs text-tan-500">{result.testCase.id}</div>
                                        </td>
                                        <td className="text-center py-2 px-3">
                                            {result.passed ? (
                                                <CheckCircle size={16} className="text-green-400 mx-auto"/>
                                            ) : (
                                                <XCircle size={16} className="text-red-400 mx-auto"/>
                                            )}
                                        </td>
                                        <td className="text-center py-2 px-3">
                                            {result.testCase.isPenetration ? (
                                                <ShieldOff size={16} className="text-red-400 mx-auto"/>
                                            ) : (
                                                <Shield size={16} className="text-green-400 mx-auto"/>
                                            )}
                                        </td>
                                        <td className="text-center py-2 px-3 font-mono text-tan-100">
                                            {result.testCase.gameResults.armorDamage}
                                        </td>
                                        <td className="text-center py-2 px-3 font-mono text-tan-100">
                                            {result.simulatedResults.armorDamage.toFixed(1)}
                                        </td>
                                        <td className="text-center py-2 px-3 font-mono">
                        <span className={getAccuracyColor(100 - Math.abs(result.deviation.armorDamage.percentage))}>
                          {result.deviation.armorDamage.percentage.toFixed(1)}%
                        </span>
                                        </td>
                                        <td className="text-center py-2 px-3 font-mono text-tan-100">
                                            {result.testCase.gameResults.bodyDamage}
                                        </td>
                                        <td className="text-center py-2 px-3 font-mono text-tan-100">
                                            {result.simulatedResults.bodyDamage.toFixed(1)}
                                        </td>
                                        <td className="text-center py-2 px-3 font-mono">
                        <span className={getAccuracyColor(100 - Math.abs(result.deviation.bodyDamage.percentage))}>
                          {result.deviation.bodyDamage.percentage.toFixed(1)}%
                        </span>
                                        </td>
                                        <td className="text-center py-2 px-3 font-mono">
                        <span className={`font-bold ${getAccuracyColor(result.accuracy)}`}>
                          {result.accuracy.toFixed(1)}%
                        </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}