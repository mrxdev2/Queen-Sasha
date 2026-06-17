/**
 * ARSLAN-MD SYSTEM MODULE
 * Core system utilities, middleware, and initialization
 */

const axios = require('axios');
const moment = require('moment-timezone');

/**
 * Initialize the system and perform startup checks
 */
async function initializeSystem(conn) {
    try {
        console.log('✅ System initialization started');
        
        // Check connection status
        if (!conn || !conn.user) {
            throw new Error('Connection not established');
        }
        
        console.log(`🔗 Connected as: ${conn.user.id}`);
        return true;
    } catch (error) {
        console.error('❌ System initialization failed:', error.message);
        return false;
    }
}

/**
 * Health check function
 */
async function healthCheck(conn) {
    try {
        const userJid = conn.user?.id;
        if (!userJid) return false;
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Get system information
 */
function getSystemInfo() {
    return {
        timestamp: moment().tz('Africa/Nairobi').format('YYYY-MM-DD HH:mm:ss'),
        platform: process.platform,
        nodeVersion: process.version,
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        },
        uptime: process.uptime()
    };
}

/**
 * Clean up temporary files
 */
async function cleanupTempFiles(dir) {
    const fs = require('fs-extra');
    try {
        if (fs.existsSync(dir)) {
            fs.emptyDirSync(dir);
            return true;
        }
    } catch (error) {
        console.error('Error cleaning temp files:', error);
        return false;
    }
}

/**
 * Format message for response
 */
function formatMessage(content, type = 'text') {
    return {
        content,
        type,
        timestamp: new Date().toISOString()
    };
}

/**
 * Error handler
 */
async function handleError(error, context = 'Unknown') {
    const errorInfo = {
        message: error.message,
        context,
        timestamp: new Date().toISOString(),
        stack: error.stack
    };
    console.error('🔴 ERROR:', JSON.stringify(errorInfo, null, 2));
    return errorInfo;
}

/**
 * Main arslanmd function - Initialize bot features
 */
async function arslanmd(conn) {
    try {
        console.log('🚀 ARSLAN-MD System loaded successfully');
        
        // Initialize system
        const systemReady = await initializeSystem(conn);
        if (!systemReady) throw new Error('System failed to initialize');
        
        // Perform health check
        const isHealthy = await healthCheck(conn);
        console.log(`💚 Health Check: ${isHealthy ? 'PASSED' : 'FAILED'}`);
        
        // Log system information
        const sysInfo = getSystemInfo();
        console.log('📊 System Info:', sysInfo);
        
        return true;
    } catch (error) {
        await handleError(error, 'arslanmd');
        return false;
    }
}

/**
 * Validate message format
 */
function validateMessage(message) {
    if (!message) return false;
    if (typeof message !== 'object') return false;
    if (!message.key || !message.message) return false;
    return true;
}

/**
 * Extract message details
 */
function extractMessageDetails(msg) {
    try {
        return {
            id: msg.key?.id,
            from: msg.key?.remoteJid,
            sender: msg.key?.participant || msg.key?.remoteJid,
            timestamp: msg.messageTimestamp,
            type: msg.message?.conversation ? 'text' : 'media',
            content: msg.message?.conversation || null
        };
    } catch (error) {
        return null;
    }
}

/**
 * Send notification to admin
 */
async function notifyAdmin(conn, message, adminJid) {
    try {
        if (conn && adminJid) {
            await conn.sendMessage(adminJid, { text: message });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Notification error:', error.message);
        return false;
    }
}

module.exports = {
    arslanmd,
    initializeSystem,
    healthCheck,
    getSystemInfo,
    cleanupTempFiles,
    formatMessage,
    handleError,
    validateMessage,
    extractMessageDetails,
    notifyAdmin
};
