package com.dtam.exception;

/**
 * Custom Exception thrown when an asset cannot be located by its code
 */
public class AssetNotFoundException extends Exception {
    private final String assetCode;

    public AssetNotFoundException(String assetCode) {
        super("Asset with code '" + assetCode + "' was not found in the Digital Twin registry.");
        this.assetCode = assetCode;
    }

    public String getAssetCode() {
        return assetCode;
    }
}
