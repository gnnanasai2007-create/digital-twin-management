package com.dtam.interfaces;

/**
 * Interface defining failure simulation and reset behavior
 */
public interface Simulatable {
    void injectFailureSimulation();
    void resetToNominalState();
    boolean isInFailureMode();
}
