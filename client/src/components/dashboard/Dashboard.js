import React , { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentProfile } from '../../actions/profile';
import Spinner from '../layout/Spinner';
import { Link } from 'react-router-dom';
import  DashboardActions  from './DashboardActions';

const Dashboard = ({ getCurrentProfile , auth: { user } , profile: { profile , loading}}) => {

    useEffect(() => {
        getCurrentProfile();
    }, []);

    return loading && profile === null ? <Spinner /> : 

    <Fragment>
        <h1 className="large text-primary">
            Dashboard
        </h1>
        <p className="lead">
            <i className="fas fa-user"></i> Welcome { user && user.name }
        </p>
        
        { //This First Fragment will show if the user has a profile
        profile !== null ? (
        <Fragment>
            <DashboardActions />
        </Fragment>
        ) 
        
        : 
        //This Second Fragment will show if the user doesn't have a profile
        (
        <Fragment>
            <p>You have not yet setup a profile, please add some info</p>
            <Link to='/create-profile' className="btn btn-primary my-1">Create Profile</Link>    
        </Fragment>
        )
        }
    </Fragment>;
};

Dashboard.propTypes = {
    getCurrentProfile: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    profile: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
    auth: state.auth,
    profile: state.profile
})

export default connect(mapStateToProps, { getCurrentProfile })(Dashboard)
