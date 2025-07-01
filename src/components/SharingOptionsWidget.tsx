"use client";

import React from 'react';

interface ViralLoopsFormWidgetInput {
    ucid: string;
}

function SharingOptionsWidget({ ucid }: ViralLoopsFormWidgetInput) {
    if (!ucid) return null;

    return React.createElement('referral-url-widget', { ucid });
}

export default SharingOptionsWidget;